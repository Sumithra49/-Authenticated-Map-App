# 🗺️ Authenticated Map App – Plot Route from A to B

A React-based web application that allows users to **log in (via Google or email/password)** and **draw a route between two points (A to B)** on a map. The route is only accessible after successful authentication.
# Deployment link:
https://authenticated-map-app-h73r.vercel.app/

# Folder Structure
![image](https://github.com/user-attachments/assets/348fcc6d-a708-4a0a-8f30-a873ee59b444)

## 🔧 Tech Stack

### ⚛️ Frontend
- **React 19**
- **Vite** (Build tool)
- **React Router DOM** (Routing)
- **React Leaflet** & **Leaflet Routing Machine** (Map & Route)
- **@react-google-maps/api** (optional alternative for Google Maps)
- **React Select** (Searchable dropdowns)
- **Lucide React** (Icons)

### 🔐 Authentication
- **Firebase Auth**
  - Google Login
  - Email/Password

### 🗺️ Maps & Routing
- **Leaflet** for rendering the map
- **Leaflet Routing Machine** for route plotting
- **OpenRouteService API** for geocoding and directions

- #  Set Environment Variables
- VITE_FIREBASE_API_KEY=your_firebase_api_key
- VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
- VITE_FIREBASE_PROJECT_ID=your_project_id
- VITE_OPENROUTESERVICE_API_KEY=your_openrouteservice_api_key



## 📌 Features

- 🔐 **Firebase Authentication** (Google & Email/Password)
- 🗺️ **Map rendering** using **React Leaflet**
- 📍 **Point A to B routing** using **Leaflet Routing Machine**
- 📍  Use **current location as Point A**
- 🕒 Displays **distance and duration**
- 🌐 Fully responsive UI with clean design
- 🔄 Graceful loading state handling

# Map & Routing
# How It Works
- The map is displayed using React-Leaflet

- Leaflet Routing Machine is used to draw the route between point A and point B

- Users can input or click to select both points

- API automatically calculates distance and estimated time

# 🔐 Auth Flow
- Unauthenticated users are redirected to the Login page

- Authenticated users can access the Map screen

- Auth state is managed using onAuthStateChanged from Firebase
   # Features Implemented
 - Use current location as starting point

 - Display distance and duration

 - Loading spinner during login/map load

 - Responsive design (mobile-friendly)
# Screenshot
# Login page
![image](https://github.com/user-attachments/assets/c86544f9-fe92-4082-a413-8394d612298e)

# Registration page
![image](https://github.com/user-attachments/assets/0716ff71-bfff-40c6-9695-6c07c52703df)

# Pop for sign in with Google
![image](https://github.com/user-attachments/assets/b1863a48-0014-4644-a0e4-763db9887c0c)


# Dashboard
![image](https://github.com/user-attachments/assets/3b782f8d-446b-42b0-9faa-143d49ab41e2)
# use current location notification
![image](https://github.com/user-attachments/assets/b6a82584-09a3-4d90-b699-8ea8426e0ded)

# Suggestion
![image](https://github.com/user-attachments/assets/45e3e1f4-246d-4c47-8bbb-14984f2717d4)
![image](https://github.com/user-attachments/assets/783ec322-c20c-48e3-99af-cc871c7bde79)

# Route distance and Duration
![image](https://github.com/user-attachments/assets/b07ae7f8-ab6a-4b26-b44e-0e21207c3ae4)
# Route 
![image](https://github.com/user-attachments/assets/19ef81ad-b593-441c-b4ba-d1bf659f4dae)
# Recent Location
![image](https://github.com/user-attachments/assets/b0757934-3453-4e31-a34e-fd2490dbecfa)
# Zoom in and Zoom out map
![image](https://github.com/user-attachments/assets/30b320c8-8198-4747-93ff-c0458debe28d)

# Signout button 
![image](https://github.com/user-attachments/assets/a2a04b06-3440-40e8-805b-c3d8cf09a630)

# Responsiveness
![image](https://github.com/user-attachments/assets/557dcedb-934b-4111-8f61-96eb0d6e2f5c)
![image](https://github.com/user-attachments/assets/507b0038-e040-464d-b8d7-e7a6ecb51ef4)














   
