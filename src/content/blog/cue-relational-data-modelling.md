---
title: "S-CUE-L: Relational data with CUE"
description: "Can you model relational data in CUE? Can you use SQL to query it? The short answer is yes, and the long answer is..."
date: 2025-03-06T14:40:00+1:00
author: "Tom van Dinther"
tags: ["CUE", "SQL"]
categories: ["Discussion"]
featured: true
---
CUE is an interesting language. Its syntax is a window into a complex directional graph of data. When you look at CUE beyond *fancy JSON*, you start to ask some interesting questions. Can you model relational data in CUE? Can you use SQL to query the data defined in CUE? The short answer is **yes**, and the long answer is **keep reading**.

---
Relational data models are a graph of entities connected by primary key and foreign key relationships. So why not model these relationships in CUE? Let's start building a relational model of a university. Our university requires at least one faculty offering at least one course before we can start accepting students and enrolments. We create a definition for `Course` and `Faculty` just like you would define a relational table. Except instead of defining a foreign key relation, we simply refer to the definition.

```json
#Course: {
    name: string
    faculty: #Faculty
}

#Faculty: {
    name: string
}

faculties: [string]: #Faculty
faculties: science: {name: "Science"}

courses: [string]: #Course
courses: cue101: {name: "CUE 101", faculty: faculties.science}

```
```json
faculties: {
	science: {
		name: "Science"
	}
}
courses: {
	cue101: {
		name: "CUE 101"
		faculty: {
			name: "Science"
		}
	}
}
```

From this brief example, we can see that CUE represents relationships fully evaluated. In SQL terminology, we could call this *fully joined* as all of the relationships are resolved.

Now that we have our first course available, we can extend this relational model to start accepting students and enrolments!
```json
#Student: {
    familyName: string
    givenName: string
    graduated: bool | *false
}

#Enrolment: {
    course: #Course
    student: #Student
    note: string | *""
}

students: [string]: #Student
students: john: {familyName: "Doe", givenName: "John"}

enrolments: [string]: #Enrolment
enrolments: johnCue101: {course: courses.cue101, student: students.john}
```
```json
students: {
	john: {
		familyName: "Doe"
		givenName:  "John"
		graduated:  false
	}
}
enrolments: {
	johnCue101: {
		course: {
			name: "CUE 101"
			faculty: {
				name: "Science"
			}
		}
		student: {
			familyName: "Doe"
			givenName:  "John"
			graduated:  false
		}
		note: ""
	}
}
```

Looks great, but we have a problem. Our entity collections are structs and we are throwing arbitrary names at the keys to identify them. We need to add structure to this. SQL tables are collections of rows. In simple terms we can say that a table is a list of rows. So let's change our entity collections from structs to lists.
```json
faculties: [...#Faculty]
courses: [...#Course]
```
This creates a new problem, it becomes very problematic to build our relationships as we now have to refer to them by the correct index.
```json
faculties: [
    {name: "Science"}
]

courses: [
    {name: "CUE 101", faculty: faculties[0]}
]

```
Perhaps not so bad, this looks just like a integer primary key except starting from `0` instead of `1`. But this approach assumes that we always want to have a single incrementing primary key. So let's be explicit about the primary key and define IDs for our entities.
```json
#Course: {
    id: int & >0
    name: string
    faculty: #Faculty
}

#Faculty: {
    id: int & >0
    name: string
}

#Student: {
    id: int & >0
    familyName: string
    givenName: string
    graduated: bool | *false
}
```
But what about enrolments? Enrolments is an associative entity as it connects students and courses with a many-to-many relationship. Associative entities are uniquely identified by a composition of the foreign keys it associates. In this case, we want to compose `student` with `course` as a primary key. Across all of these keys, we need to ensure uniqueness, and so we turn to another useful concept, indexes.

We can easily construct a primary index in CUE using structs, then building our entity lists from the primary index.
```json
import "strconv"

#FacultyIndex: [ID= =~ "^\\d+$"]: #Faculty & {id: strconv.ParseInt(ID, 10, 32)}
_facultiesById: #FacultyIndex
faculties: [for faculty in _facultiesById {faculty}]

_facultiesById: "1": {name: "Science"}
```
We define a new hidden field for our index and constrain the key field to valid parse-able integers. We then also convert this field into an integer and assign it to the `id` field of the faculty entity. This pattern is repeated for courses and students.

Remember to close the struct on the index. You can do this by either using a definition to constrain your index, or by calling `close()` on the constraint.
```json
_facultiesById: close({[ID= =~ "^\\d+$"]: #Faculty & {id: strconv.ParseInt(ID, 10, 32)}})
```

The enrolments index takes a slightly different approach due to its usage of composite keys. In this case we construct a multi-keyed index by student and then by course (or vice versa). Using labels on those key fields, we then lookup the course and student from their respective ID indexes to populate the course and student fields.
```json
_enrolmentsByStudentIdByCourseId: [StudentId= =~ "^\\d+$"]: [CourseId= =~ "^\\d+$"]: #Enrolment & {
    course: _coursesById[CourseId]
    student: _studentsById[StudentId]
}
enrolments: [for byStudent in _enrolmentsByStudentIdByCourseId for byCourse in byStudent {byCourse}]

_enrolmentsByStudentIdByCourseId: "1": "1": note: "Special admission"
```
```json
enrolments: [{
	course: {
		id:   1
		name: "CUE 101"
		faculty: {
			id:   1
			name: "Science"
		}
	}
	student: {
		id:         1
		familyName: "Doe"
		givenName:  "John"
		graduated:  false
	}
	note: "Special admission"
}]
```

Using these patterns, you're able to build whichever secondary indices you require to make data construction easier. Putting this all together we have a data model for our university!
```json
faculties: [{
	id:   1
	name: "Science"
}]
courses: [{
	id:   1
	name: "CUE 101"
	faculty: {
		id:   1
		name: "Science"
	}
}]
students: [{
	id:         1
	familyName: "Doe"
	givenName:  "John"
	graduated:  false
}]
enrolments: [{
	course: {
		id:   1
		name: "CUE 101"
		faculty: {
			id:   1
			name: "Science"
		}
	}
	student: {
		id:         1
		familyName: "Doe"
		givenName:  "John"
		graduated:  false
	}
	note: "Special admission"
}]
```
## S-CUE-L
So now that we have a relational data model, is it possible to query it using SQL? The answer is absolutely yes! It takes a little bit of fancy CUE to hack our way there but it is certainly possible. What it takes is for the fully joined data model to be processed into an unjoined, tabular format which we can then import into an SQLite database. We also need to take care of converting certain CUE values into values compatible with SQLite. For example, `bool` into integers `0` for `false` and `1` for `true`.

```json
#SQL: {
    sources: [SourceName=string]: [...{...}] & list.MinItems(1) // must have at least one record/row for inference
    tables: [...#Table]
}

#Table: {
    name: string
    columns: [...{name: string, valueMetadata: #Value}]
    values: [...[...#Value]]
    sqliteValues: [for row in values {[for value in row {value.sqlite}]}]
}
```
Shown here is our high-level approach to the process. We feed a collection of sources where `SourceName` becomes the table name. Our logic will then iterate these sources to construct a series of relational tables. Each table has a name, a list of columns with associated value metadata, and a matrix of values. Lastly, there is also a list comprehension for `sqliteValues` which is a convenience for accessing the SQLite mapped values later on.

The mapping of CUE values to SQLite values is done in the value definition. Here we define the valid CUE types which we can map, the SQLite type name, and the CUE-SQLite compatible type. Note that `bool` is not listed here as we map these to `int`. We check that the unification of the CUE value and the test type is not an error, to determine the type of the CUE value, to then set a concrete value on the rest of the fields.
```json
#Value: {
    cue: string | bool | float | int | bytes | null
    sqliteType: "TEXT" | "REAL" | "INTEGER" | "BLOB" | "NULL"
    sqlite: string | float | int | null

    if (cue & string) != _|_ {
        sqliteType: "TEXT"
        sqlite: cue
    }
    if (cue & int) != _|_ {
        sqliteType: "INTEGER"
        sqlite: cue
    }
    if (cue & bool) != _|_ {
        sqliteType: "INTEGER"
        if cue {
            sqlite: 1
        }
        if !cue {
            sqlite: 0
        }
    }
    if (cue & float) != _|_ {
        sqliteType: "REAL"
        sqlite: cue
    }
    if (cue & bytes) != _|_ {
        sqliteType: "BLOB"
        sqlite: cue
    }
    if (cue & null) != _|_ {
        sqliteType: "NULL"
        sqlite: cue
    }
}
```

To populate the table column data we grab the first row of the source data (which we constrained to have at least 1 item so we could infer at this stage). We only look at values which are not lists (addressed later on), and map structs to a foreign key relation column suffixed with `_id`, otherwise we represent the value.
```json
columns: [for k, v in source[0] if (v & [..._]) == _|_ {
    [
        if (v & {...}) != _|_ { // if is struct
            name: "\(k)_id"
            valueMetadata: #Value & {cue: v.id}
        },
        { // else
            name: k
            valueMetadata: #Value & {cue: v}
        }
    ][0]
}]
```
This shows the approach to unjoining the data model, we can consider that any struct value should be converted into a primary key reference of the referenced struct's ID. For this we assume that we have consistently named the primary key field `id` on all strong entities.

To populate the matrix of values the same approach is used as for the columns, except we only map the value in the comprehension.
```json
[
    if (v & {...}) != _|_ { // if is struct
        #Value & {cue: v.id}
    },
    { // else
        #Value & {cue: v}
    }
][0]
```

But what about list values? This is a special case which can be addressed in several different ways. The easiest approach to modelling lists is using a comma-separated string (if the lists are short and consist of strings). The more robust approach to modelling lists is by creating a new associative table for them. In this table, each row is one element of the list, with a foreign key column relating it to the entity to which it originally belonged.

Let's add lists to our data model to show this in action. Courses can now have a list of arbitrary tags.
```json
#Course: {
    id: int & >0
    name: string
    faculty: #Faculty
    tags: [...string]
}
```
Our intention now is to automatically identify fields in our sources which have lists and construct a new table from them. In this case we will have a `courses_tags` table with the foreign key of the course ID, and the string tag. The CUE for this is:
```json
    [for sourceName, source in sources for key, value in source[0] if (value & [..._]) != _|_ {
        let keys = [for k, _ in source[0] {k}]
        #Table & {
            name: "\(sourceName)_\(key)"
            columns: [{
                name: "\(sourceName)_id"
                valueMetadata: #Value & {cue: source[0].id}
            }, {
                name: key
                valueMetadata: #Value & {cue: value[0]}
            }]
            values: [for row in source for k in keys if (row[k] & [..._]) != _|_ for v in row[k] {
                [#Value & {cue: row.id}, #Value & {cue: v}]
            }]
        }
    }]
```
This is the simple form, as it is a hard-coded solution to only lists of simple types. Lists of lists or lists of other relationships such as structs will be misrepresented using this code. I leave it up to you to generalise this further.

The last thing we need to construct the SQL representation of our data model is to create the table schema, the data definition code. We add this field to our SQL definition and use a comprehension with string interpolations to create the SQL DDL code required.
```json
#SQL: {
    sources: [SourceName=string]: [...{...}] & list.MinItems(1) // must have at least one record/row for inference
    tables: [...#Table]
    tableDDL: [...string]

	tableDDL: [for table in tables {
        let columns = strings.Join([for column in table.columns {"\(column.name) \(column.valueMetadata.sqliteType)"}], ", ")
        
        """
        CREATE TABLE \(table.name) (\(columns));
        """
    }]
}
```

Bringing this all together, we can construct our SQL model for our university by simply defining the sources.
```json
sqlModel: #SQL & {
    sources: {
        "students": students
        "faculties": faculties
        "courses": courses
        "enrolments": enrolments
    }
}
```
A heavily reduced `cue eval` of `sqlModel`.
```json
sources: {
    students: [{
        id:         1
        familyName: "Doe"
        givenName:  "John"
        graduated:  true
    }]
    faculties: [{
        id:   1
        name: "Science"
    }]
    courses: [{
        id:   1
        name: "CUE 101"
        faculty: {
            id:   1
            name: "Science"
        }
        tags: ["Computer Science", "Logic"]
    }]
    enrolments: [{
        course: {
            id:   1
            name: "CUE 101"
            faculty: {
                id:   1
                name: "Science"
            }
            tags: ["Computer Science", "Logic"]
        }
        note: "Special admission"
        student: {
            id:         1
            familyName: "Doe"
            givenName:  "John"
            graduated:  true
        }
    }]
}
tables: [{
    name: "students"
    columns: [{
        name: "familyName"
        valueMetadata: {
            cue:        "Doe"
            sqliteType: "TEXT"
            sqlite:     "Doe"
        }
    }, {
        name: "givenName"
        valueMetadata: {
            cue:        "John"
            sqliteType: "TEXT"
            sqlite:     "John"
        }
    }, {
        name: "graduated"
        valueMetadata: {
            cue:        true
            sqliteType: "INTEGER"
            sqlite:     1
        }
    }, {
        name: "id"
        valueMetadata: {
            cue:        1
            sqliteType: "INTEGER"
            sqlite:     1
        }
    }]
    values: [[{
        cue:        "Doe"
        sqliteType: "TEXT"
        sqlite:     "Doe"
    }, {
        cue:        "John"
        sqliteType: "TEXT"
        sqlite:     "John"
    }, {
        cue:        true
        sqliteType: "INTEGER"
        sqlite:     1
    }, {
        cue:        1
        sqliteType: "INTEGER"
        sqlite:     1
    }]]
    sqliteValues: [["Doe", "John", 1, 1]]
}, {
    name: "faculties"
    ...
}, {
    name: "courses"
    ...
}, {
    name: "enrolments"
    ...
}, {
    name: "courses_tags"
    columns: [{
        name: "courses_id"
        valueMetadata: {
            cue:        1
            sqliteType: "INTEGER"
            sqlite:     1
        }
    }, {
        name: "tags"
        valueMetadata: {
            cue:        "Computer Science"
            sqliteType: "TEXT"
            sqlite:     "Computer Science"
        }
    }]
    ...
}]
tableDDL: ["CREATE TABLE students (familyName TEXT, givenName TEXT, graduated INTEGER, id INTEGER);", ...]
```

Now comes the fun part, loading it into SQLite. We can use CUE's workflow commands to script this process. We define a command named `sql` which makes a temporary directory, writes CSV files containing all of the table data, then executes the SQLite binary with a series of flags to load the table schemas, and import the data from the CSV files.
```json
command: sql: {
    mkTemp: file.MkdirTemp

    writeTables: [for table in sqlModel.tables {
        file.Create & {
            filename: "\(mkTemp.path)/\(table.name).csv"
            contents: csv.Encode(list.Concat([[[for column in table.columns {column.name}]], table.sqliteValues]))
        }
    }]

    execute: exec.Run & {
        $dependsOn: [writeTables]
        mustSucceed: false
        cmd: list.Concat([["sqlite3", ":memory:", "-header", "-table"], list.FlattenN([for ddl in sqlModel.tableDDL {["-cmd", ddl]}], 1), list.FlattenN([for table in sqlModel.tables {["-cmd", ".import \(mkTemp.path)/\(table.name).csv \(table.name) --csv --skip 1"]}], 1)])
    }

    clean: file.RemoveAll & {
        $dependsOn: [execute]
        path: mkTemp.path
    }
}
```

Now when we run `cue cmd sql`, we get an interactive SQLite shell in which we can write our queries. Success!
```sh
sqlite> .schema
CREATE TABLE students (familyName TEXT, givenName TEXT, graduated INTEGER, id INTEGER);
CREATE TABLE faculties (name TEXT, id INTEGER);
CREATE TABLE courses (name TEXT, faculty_id INTEGER, id INTEGER);
CREATE TABLE enrolments (note TEXT, course_id INTEGER, student_id INTEGER);
CREATE TABLE courses_tags (courses_id INTEGER, tags TEXT);
```

```sh
sqlite> select * from courses;
+---------+------------+----+
|  name   | faculty_id | id |
+---------+------------+----+
| CUE 101 | 1          | 1  |
| SQL 101 | 1          | 2  |
+---------+------------+----+
```

```sh
sqlite> SELECT tags FROM courses c JOIN courses_tags ct ON c.id == ct.courses_id WHERE c.name LIKE '%CUE%';
+------------------+
|       tags       |
+------------------+
| Computer Science |
| Logic            |
+------------------+
```
---

The marriage of CUE and SQL; is this a winning combination like peanut butter and chocolate, or a [marmite](https://en.wikipedia.org/wiki/Marmite) and chocolate abomination? For the purposes of exploration, I did not stop to think whether I *should*. But I am happy to report that I in fact *could*, and now you can too.

**You can check out my code for this Frankenstein operation on [GitHub](https://github.com/tvandinther/cue-sandbox/tree/37b666b5df32baa6a936ed095d4191469fa442ed/sqlite).**