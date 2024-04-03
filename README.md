# CPSC 310 Project Repository

This repository contains starter code for the class project.
Please keep your repository private.

For information about the project, autotest, and the checkpoints, see the course webpage.

## Sections Insight Documentation (C3)

### Description

Section Insight is a service that allows users to add, view, and manage datasets containing course sections. The service provides a user interface that allows users to view a list of sections, add new sections, and view three graphical insights about the dataset. The service also provides a REST API that allows users to interact with the service programmatically.

### Video Link

[Section Insight Video](https://youtu.be/)

If the link does not work, copy and paste the following URL into your browser:

`https://youtu.be/`

### Run the Project

To run the project, the correct version of Node and dependant packages must be installed (`yarn install`). The project can be run in dev mode on your localhost by following the steps below:

1. `cd` to the project **root directory**

2. running `npm run start` or `yarn start` will start both the server and the client in dev mode (to start the server and the client separately, run `yarn start:server` and `yarn start:client`)

3. in the terminal, Vite will provide a local address for you to access the project's frontend

4. open the address in your browser to view the project (if the server takes a long time to start, make sure to refresh the page after the server has started)

## Configuring your environment

To start using this project, you need to get your development environment configured so that you can build and execute the code.
To do this, follow these steps; the specifics of each step will vary based on your operating system:

1. [Install git](https://git-scm.com/downloads) (v2.X). You should be able to execute `git --version` on the command line after installation is complete.

1. [Install Node LTS](https://nodejs.org/en/download/) (LTS: v18.X), which will also install NPM (you should be able to execute `node --version` and `npm --version` on the command line).

1. [Install Yarn](https://yarnpkg.com/en/docs/install) (1.22.X). You should be able to execute `yarn --version`.

1. Clone your repository by running `git clone REPO_URL` from the command line. You can get the REPO_URL by clicking on the green button on your project repository page on GitHub. Note that due to new department changes you can no longer access private git resources using https and a username and password. You will need to use either [an access token](https://help.github.com/en/github/authenticating-to-github/creating-a-personal-access-token-for-the-command-line) or [SSH](https://help.github.com/en/github/authenticating-to-github/adding-a-new-ssh-key-to-your-github-account).

## Project commands

Once your environment is configured you need to further prepare the project's tooling and dependencies.
In the project folder:

1. `yarn install` to download the packages specified in your project's _package.json_ to the _node_modules_ directory.

1. `yarn build` to compile your project. You must run this command after making changes to your TypeScript files. If it does not build locally, AutoTest will not be able to build it.

1. `yarn test` to run the test suite.

    - To run with coverage, run `yarn cover`

1. `yarn lint` to lint your project code. If it does not lint locally, AutoTest will not run your tests when you submit your code.

1. `yarn pretty` to prettify your project code.

If you are curious, some of these commands are actually shortcuts defined in [package.json -> scripts](./package.json).

## Running and testing from an IDE

IntelliJ Ultimate should be automatically configured the first time you open the project (IntelliJ Ultimate is a free download through the [JetBrains student program](https://www.jetbrains.com/community/education/#students/)).

### License

While the readings for this course are licensed using [CC-by-SA](https://creativecommons.org/licenses/by-sa/3.0/), **checkpoint descriptions and implementations are considered private materials**. Please do not post or share your project solutions. We go to considerable lengths to make the project an interesting and useful learning experience for this course. This is a great deal of work, and while future students may be tempted by your solutions, posting them does not do them any real favours. Please be considerate with these private materials and not pass them along to others, make your repos public, or post them to other sites online.
