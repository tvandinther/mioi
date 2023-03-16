---
title: "Creating a MongoDB instance with a web interface in Docker"
description: "How to create a MongoDB instance with a web interface in Docker"
date: 2021-09-02T12:59:47+12:00
draft: false
author: "Tom van Dinther"
prism_lineno: false
tags: ["docker", "mongoDB"]
categories: ["containerisation"]
series: ["Taming Docker"]
comments: true
bookcase_cover_src: "posts/docker-mongo.png"
bookcase_cover_src_dark: "posts/docker-mongo.png"
---
When building a full-stack application with MongoDB as your database, it can often be difficult to start out. Installing all of the right pieces on your machine for the first time can be difficult and perhaps a Google search for this is the very thing that brought you here. You may also be somewhat familiar with Docker, and so you'd like to try build your full-stack along with Docker to ease your development experience. Because Docker is such a wonderful tool, it can make our task easy and automated. Everything we are going to set up here can be pushed to your project's remote git repository and be brought to life on another computer with a single command. Now that's a great developer experience.

## MongoDB

We are going to set up our environment using the `docker-compose` command-line tool. With `docker-compose` we are able to define our services in a configuration file and run the command-line tool against it to bring our environment to life.

To start off our configuration, we will create a file named `docker-compose.yml` at the top level of our project directory and start off with the following 2 lines:

```yaml
version: "3.9"
services:
	
```

`version: "3.9"` tells the command-line tool which version of the API to use when parsing this configuration. As of writing, 3.9 is the latest version.
`services` is the top-level property which will contain the definitions for all of the services we would like in our environment.

The first service we will create is the database itself.

```yaml
version: "3.9"
services:

  mongodb:
    image: mongo:bionic
    ports:
      - "27017:27017"
```
Here we are defining a service named `mongodb` and specifying the image to be used as `mongo:bionic`. `bionic` is a version tag of the image. It is always a good idea to pin your images to a tag to ensure predictability in a configuration. Sometimes, the way in which images are configured changes, environment variables get deprecated and configuration file structures altered. By pinning the version we can ensure that we can start our environment the same as when we created it years into the future.

`ports:` is used to connect a port from the host machine to the container. The shorthand syntax used here is `<host port>:<container port>`. In this case, we are connecting port 27017 on our host machine to port 27017 of the container.

Running this configuration now would create a container running an instance of MongoDB accessible from `localhost:27017`. We can do this by running the following command:

```bash
docker-compose up
```

The command automatically looks for a file in the current working directory named `docker-compose.yml` to receive its instructions.

When you are ready to stop and remove the containers you can do this with:

```bash
docker-compose down
```

Something important to note about our configuration is that in this state, the instance of MongoDB will start without authentication enabled. This isn't analogous of a production environment, and our applications that use the database will be relying on making an authenticated connection. To do this we need to add a few more lines to our `docker-compose.yml` file.

On the Docker Hub page for the [mongo](https://hub.docker.com/_/mongo) image we are given some information on how to use it. The entrypoint script of this image looks for the two environment variables `MONGO_INITDB_ROOT_USERNAME` and `MONGO_INITDB_ROOT_PASSWORD` to create a root user account in the database. We can supply these by using `environment:` in the yaml file as follows:

```yaml
version: "3.9"
services:

  mongodb:
    image: mongo:bionic
    hostname: mongo
    environment:
      MONGO_INITDB_ROOT_USERNAME: root
      MONGO_INITDB_ROOT_PASSWORD: test1234
    ports:
      - "27017:27017"
```

Running this configuration now would create an authenticated instance of MongoDB. However, conveniently connecting to and managing the database in this state requires some tools. Perhaps we can download a tool like [MongoDB Compass](https://www.mongodb.com/products/compass), or we could use a web interface like *Mongo Express*.

## Mongo Express

*Mongo Express* is a web client for MongoDB written in Node.js using the express framework. It contains functionality for us to be able to perform CRUD operations on the database as well as some monitoring and administrative tasks. What's better yet, is we can spin one of these up within our `docker-compose` configuration.

To do this, we define a new service just like before. Create a new line underneath the `mongodb` service and define the following:

```yaml
  mongo-express:
    image: mongo-express
    environment:
      ME_CONFIG_MONGODB_SERVER: mongodb
      ME_CONFIG_MONGODB_ADMINUSERNAME: root
      ME_CONFIG_MONGODB_ADMINPASSWORD: test1234
      ME_CONFIG_BASICAUTH_USERNAME: admin
      ME_CONFIG_BASICAUTH_PASSWORD: admin
    ports:
      - "8081:8081"
    depends_on:
      - mongodb
```

The Docker Hub page on the [mongo-express](https://hub.docker.com/_/mongo-express) image gives us some details on how to use it. Specifically, we are interested in the port the web server listens on and the environment variables used for configuration. We can see that the port we need to map is port 8081, which we've mapped to our host port 8081. 

We then need to tell mongo-express how to connect to our database. For this we use the `ME_CONFIG_MONGODB_` environment variables where `SERVER` is the hostname of the container the MongoDB instance is running on and `ADMINUSERNAME` and `ADMINPASSWORD` are the credentials to an account with admin level access across the database. For this we can use the credentials of the root account we defined earlier. Lastly, the `ME_CONFIG_BASICAUTH_` environment variables define the credentials we can use to log in to the web interface.

`depend_on:` does what you'd expect; it waits for the containers it depends on to start before starting itself. This is important because the `mongo-express` container will exit if it fails to establish a connection to the instance of MongoDB. Doing this will ensure that it starts correctly *almost* consistently. Why only *almost*? Docker will wait until the listed containers start successfully but it does not know if the software inside of the containers have finished initialising and opened sockets on their ports yet. This creates a race condition and may require a manual restart of the `mongo-express` container if it wins the race.

In a docker-compose environment, the hostname of a service is automatically given by the name of the service. A hostname can also be manually provided by using the `hostname:` property. This behaviour is true for the user-defined *bridge* network mode. So for DNS resolution to occur, and for our `mongodb` service to be found by `mongo-express` we must define our own network and assign it to our services.
###### Refer to the documentation on [docker.com](https://docs.docker.com/network/bridge/) for more details.

At the bottom of our `docker-compose.yml` add a new top-level property and sub property as follows:

```yaml
networks:
  internal-network:
    driver: bridge # default, can be omitted
```

To assign this network to our services add it to each service configuration:

```yaml
  mongodb:
    image: mongo:bionic
    hostname: mongo
    environment:
      MONGO_INITDB_ROOT_USERNAME: root
      MONGO_INITDB_ROOT_PASSWORD: test1234
    ports:
      - "27017:27017"
    networks:
      - internal-network

  mongo-express:
    image: mongo-express
    environment:
      ME_CONFIG_MONGODB_SERVER: mongodb
      ME_CONFIG_MONGODB_ADMINUSERNAME: root
      ME_CONFIG_MONGODB_ADMINPASSWORD: test1234
      ME_CONFIG_BASICAUTH_USERNAME: admin
      ME_CONFIG_BASICAUTH_PASSWORD: admin
    ports:
      - "8081:8081"
    depends_on:
      - mongodb
    networks:
      - internal-network
```

Running this configuration now would create an authenticated instance of MongoDB accessible from `localhost:27017` and a web interface accessible from `localhost:8081`.

## Populate the database

Now we have a MongoDB instance running and an interface to access it with ease, we may want to add some data for our consuming application to fetch. One option is to manually add the data through Mongo Express. It contains options to import batch data through csv. Another option is to insert data using scripted Mongo shell. We will go through the configuration to allow both options as they each uncover new details about our docker-compose configuration.

### Using Mongo Express

I won't go through the details of actually importing data via csv, as the interface can guide you through that process. However, when you run `docker-compose down` the database container is removed and with it, all of the imported data! You don't want to go through this process every time a container is created so one way in which we can persist the data is by mounting an external volume onto the directory inside the container which contains the data. This way when the container is created, we can use our host's directory to serve up the data. Note that this method of populating the database is not preserved through git.

We will create a volume bind whereby a host directory is mounted onto a container directory. This is simply done by modifying the `docker-compose.yml` file accordingly:

```yaml
  mongodb:
    image: mongo:bionic
    hostname: mongo
    environment:
      MONGO_INITDB_ROOT_USERNAME: root
      MONGO_INITDB_ROOT_PASSWORD: test1234
      MONGO_INITDB_DATABASE: admin
    networks:
      - internal-network
    ports:
      - "27017:27017"
    volumes:
      - ./db-data:/data/db
```

The [documentation](https://docs.docker.com/compose/compose-file/compose-file-v3/#volumes) describes several ways in defining a volume. Some ways may be more suitable for your needs than others. In this example we are using a directory relative to the `docker-compose.yml` file named `db-data` to serve as the source for the containers `/data/db` directory.

### Using Mongo shell script

An alternative method to populating the database is by seeding it on initialistion through the use of initialisation scripts. These have the upside of being preserved through git but have the downside (possibly an upside for testability) that any data inserted after initialisation is lost when the container is rebuilt.

To do this, the first thing we must do is create our script. Mongo shell script uses javascript and so to begin we will create a file named `init-data.js` inside of a new directory named `mongo` to contain our mongo specific artifacts. The first line in our script will be an instruction to authenticate as the root user which must be done against the `admin` database. Then we will change our context to our application database which we will name `mydatabase`.

```javascript
db.auth(_getEnv("MONGO_INITDB_ROOT_USERNAME"), _getEnv("MONGO_INITDB_ROOT_PASSWORD"))

db = db.getSiblingDB('mydatabase')
```
The script starts with a global `db` object pre-defined as the initial database. Which database is set as the initial database for our initialisation scripts is set by an environment variable which we will set up shortly. We authenticate using the `auth()` method of the `db` object and pass in the username and password from the environment variables using the built-in function `_getEnv()`. We then change our `db`object to a new database object named `mydatabase`.

From here we can insert any data we wish by using the pattern `db.<collection name>.insert(<object>)`. For example:

```javascript
db.blogPosts.insert({
	title: "Creating a MongoDB instance in Docker with a web interface",
	author: "Tom van Dinther",
	createdAt: ISODate("2021-08-30T16:00:00.000Z")
})
```

Once you have defined the seed data you'd like to populate the database with, we need to give the container access to it in a directory where the entrypoint script looks for it. As given by the image [documentation](https://hub.docker.com/_/mongo) this location is `/docker-entrypoint-initdb.d/`. To do this, we define a bind volume of our project's `mongo` directory as follows:

```yaml
  mongodb:
    image: mongo:bionic
    hostname: mongo
    environment:
      MONGO_INITDB_ROOT_USERNAME: root
      MONGO_INITDB_ROOT_PASSWORD: test1234
      MONGO_INITDB_DATABASE: admin
    networks:
      - internal-network
    ports:
      - "27017:27017"
    volumes:
      - ./mongo:/docker-entrypoint-initdb.d/
```

In this step we have also defined the initial database that our scripts will be given via the global `db` object using the `MONGO_INITDB_DATABASE` environment variable. We have specified this to be `admin` so that the script can authenticate as a root user which is stored in this database.

## Conclusion

Congratulations, you should now have an instance of MongoDB running inside of a container using Docker and a web interface with admin access. This isn't the end of configuring MongoDB inside of Docker, so be sure to come back and find links to the other parts in this post when they come available. Take a look below at our fInal `docker-compose.yml` file:

```yaml
version: "3.9"
services:

  mongodb:
    image: mongo:bionic
    environment:
      MONGO_INITDB_ROOT_USERNAME: root
      MONGO_INITDB_ROOT_PASSWORD: test1234
      MONGO_INITDB_DATABASE: admin
    networks:
      - internal-network
    ports:
      - "27017:27017"
    volumes:
#      - ./db-data:/data/db
      - ./mongo:/docker-entrypoint-initdb.d/

  mongo-express:
    image: mongo-express
    environment:
      ME_CONFIG_MONGODB_SERVER: mongodb
      ME_CONFIG_MONGODB_ADMINUSERNAME: root
      ME_CONFIG_MONGODB_ADMINPASSWORD: test1234
      ME_CONFIG_BASICAUTH_USERNAME: admin
      ME_CONFIG_BASICAUTH_PASSWORD: admin
    ports:
      - "8081:8081"
    networks:
      - internal-network
    depends_on:
      - mongodb

networks:
  internal-network:
    driver: bridge # default, can be omitted
```
