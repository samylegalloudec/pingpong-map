Ce projet a été créé pour le module "Initiation à la recherche" d'IMT Atlantique.

## How to use this project

First, you need to be sure to have node js installed on your computer. You can install the latest version here :
[https://nodejs.org/en/](https://nodejs.org/en/)

Now, you can install the dependencies of the project with :

### `npm install`

Once the command is completed, you can run the project with the command :

### `npm start`

Runs the app in the development mode.<br />
Open [http://localhost:1234](http://localhost:1234) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

You need to have the back-end running to get the results of the traceroutes.

## What is used in the project

The library used to display the map is [https://openlayers.org/](https://openlayers.org/)

The dev environment is built with [https://parceljs.org/](https://parceljs.org/)

## How does it work

There are two possible requests. The first one show the routes from a traceroute between the backend server and the IP that you wrote into the input.
The result is stored in a redis database in the backend.

The other request shows the result of all the traceroutes results stored in the redis database.
We can easily see that some routes are used a lot by different IP addresses. 

Link of the presentation : 

[https://docs.google.com/presentation/d/1J6Gn3-20UrDgC5_Wi6Tt_dhnymZp_IfxwGfGpg2wBFc/edit#slide=id.gad729dee0f_0_95](https://docs.google.com/presentation/d/1J6Gn3-20UrDgC5_Wi6Tt_dhnymZp_IfxwGfGpg2wBFc/edit#slide=id.gad729dee0f_0_95)

