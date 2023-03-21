export function mergeClasses(...classes: string[]) {
    return classes.join(" ");
}

Date.prototype.toFormattedDateString = function () {
    return this.toLocaleDateString('en-US', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
    });
}
