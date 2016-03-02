eere-appliance-calculon
=======================

Prototype for a simple appliance calculator.

Figure out how much energy your boom-box uses running it 24/7/365.  :speaker:

Try out the Demo
http://nrel.github.io/eere-appliance-calculon/

![screenshot](./screenshot.jpg)




## Development

Work in the src folder.

Use the grunt default task to build the application in the ```dist``` folder

Use the grunt aws task to deploy to Amazon S3, or the ghpages task to deploy to github.io.

grunt will need your AWS credentials to push to AWS. By default it will look for a file called  /_config/s3.js at the root. That file should look like:


```js
module.exports = {
    accessKeyId: 'your_key',
    secretAccessKey: 'your_secret_key'
}
```


See ```grunt --help``` for more tasks.

## Background

This calculator uses state energy rate data from the EIA API at
http://www.eia.gov/opendata/
