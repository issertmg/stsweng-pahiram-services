# Pahiram Services (s12g7)
A simple web app simulation of DLSU-USG's *Pahiram Locker* and DLSU-CSG's *Pahiram Services*. Features a rental system for lockers and equipment such as umbrellas, extension cords, VGA and HDMI cables, and markers.

## Features
* The web app is designed to be responsive. This means that all pages and features are easily accessible across any platform, from desktops to mobile phones.
  
  ![Mobile version](/readme_imgs/reserve-mobile.jpg) ![Mobile version](/readme_imgs/sidebar-mobile.jpg)
  
* Users may log in and register via their DLSU Google accounts.
  
  ![Sign in via Google](/readme_imgs/signin.jpg)

* There are two user roles. Students can make locker and equipment reservations.
  
  ![Student Home](/readme_imgs/home-student.jpg)
  
  Student respresentatives are the administrators of the app.
  
  ![Student Rep Home](/readme_imgs/home-studentrep.jpg)

* Students may view their profile and edit their contact number. To update other information, the user has to approach the student representative.
  
  ![Edit Profile](/readme_imgs/edit-profile.jpg)

* Students may reserve lockers, from all buildings and floors, that are available for rent. Students may only rent one locker at a time.

  ![Reserve a locker](/readme_imgs/reserve-locker.jpg)
  
  Students may also reserve equipment (subject to Pahiram Services' terms and conditions). They may only rent up to two equipment at a given day.

  ![Reserve equipment](/readme_imgs/reserve-equipment.jpg)

* Students may view reservations made, and cancel ones that are on their initial stages when they change their minds.

  ![Manage reservations](/readme_imgs/my-reservations.jpg)

* Students may view the terms and conditions of Pahiram Services. They are also constantly reminded of the service's terms when making a reservation.

  ![Terms](/readme_imgs/terms.jpg)

* Student representatives may manage lockers (i.e. add new panels from specified locations, view panels and their respective lessees, mark broken lockers, and delete vacant panels).
  
  ![Manage lockers](/readme_imgs/add-panel.jpg)

* Student representatives may manage equipment (i.e. add new equipment, update equipment availability, view a list of all equipment, and delete equipment).
  
  ![Manage equipment](/readme_imgs/manage-equipment.jpg)

* Student representatives may manage all types of reservations (e.g. view all reservations and respond to them by changing their statuses and attaching remarks, as well as charging penalties for uncleared reservations).

  ![Manage reservations](/readme_imgs/manage-reservations.jpg)
  
  ![Manage reservations](/readme_imgs/edit-reservation.jpg)

* Student representatives may manage people (view all users, update their important profile information such as ID number and name, promote students to student representatives, and demote student representatives to students).

  ![Manage people](/readme_imgs/manage-people.jpg)

* For unreturned equipment past 6pm, the appropriate penalties are automatically applied.

## Accessing the Deployed Web App
The web app can now be accessed online through this [link](https://pahiram-services.herokuapp.com/). If you want to access the app through your local machine, follow the instructions on the next sections.

## Getting Started
These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites
```
Node.js
Node Package Manager (NPM)
Git (optional)
```

### Installation and Setup
1. Clone repository
    ```
    git clone https://github.com/ccapdev1920T2/s12g7.git
    ```
2. Install all npm packages used by typing the following command in the terminal:
    ```
    npm install
    ```
3. Set up the environment variables. Google OAuth 2.0 has been used to authenticate and authorize DLSU users. User uploads (i.e. equipment images) are stored in an AWS S3 bucket. The Google OAuth2.0 and AWS S3 credentials are stored as environment variables due to security reasons in the deployment process. To set up the environment variables on the local machine, a separate file, ```.env```, is privately sent to the professor. This file must be placed at the root directory of the project before starting it.

### Running
1. Run the server by typing in the command:
    ```
    node index.js
    ```
2. Access the [localhost](http://localhost:3000). Users who have not yet logged in will be redirected to the log in page.

    ![Log in page](/readme_imgs/login.jpg)
  
3. Log in using your DLSU Google account. First time users will be redirected to the register page and will be asked to complete the user's information. 

    ![Register page](/readme_imgs/register.jpg)

    The first user who registers automatically becomes a student representative

4. The user is now ready to use the web app. Students can only access limited features in the app, 

    ![Student](/readme_imgs/home-student.jpg)

    while student representatives are given administrative privileges to all features

    ![Student](/readme_imgs/home-studentrep.jpg)

## Important Notes
* When creating an equipment, the student representative has the freedom to choose any image they want to describe the equipment. However, it is advised to design equipment images with design consistency in mind. For instance, the image has to have an aspect ratio of 1:1 to better work with the card layout the developers had in mind when designing the web app. To better visualize the images, the developers have created nine sample images that match the web app's design language. The files are accessible on the same project folder at: ```./public/static/equipment-types/```

## Authors
- Badulis, Keith Gabriel
- Gagan, Isser Troy
- Matias, Maria Angela Mikaela

## Acknowledgements
- Sir Arren for patiently teaching us
