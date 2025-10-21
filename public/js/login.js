const loginForm = document.querySelector(".form");
import { showAlert } from './alerts.js';
console.log("showAlert function imported: ", showAlert);


 async function login(email, password){
    //function body
    console.log("email received: ", email);
    console.log("password received: ", password);
    try{
         console.log("trying")
      const res =   await axios(
            {
            method: "POST",
            url: 'http://localhost:3000/api/v1/users/login',
            data:{
                email, 
                password
            }
        }
    )

    console.log(res.status)
    console.log("The response received is: ", res);
    
    if(res.data.status === 'success'){
        console.log("Successfully logged in");
        console.log("Token received: ", res.data.token);
        showAlert('success', 'You are logged in successfully.');

        // alert("Logged in successfully!");
        // Optionally redirect to another page
        // window.location.href = '/api/v1/views/login';

       window.setTimeout(()=>{
        //
        location.assign('/api/v1/views/login')
       }, 3000);
    }

    }
    catch(error){
        console.log("showing errors")
        console.log(error.message);
        // Show alert for login failure
        showAlert('error', 'could not log in.')
        if(error.response && error.response.data && error.response.data.message) {
            // alert(`Login failed: ${error.response.data.message}`);
            showAlert('error', 'could not log in.')

        } else {
            // alert("Login failed. Please check your credentials and try again.");
            showAlert('error', 'Failed. Please check your credentials and try again.')

        }
    }
}




loginForm.addEventListener("submit", e =>{
    
    e.preventDefault();
    const userEmail = loginForm.querySelector("#email").value;
    const userPassword = loginForm.querySelector("#password").value;

    login(userEmail, userPassword);
    console.log("Logging in the users now.");
}
);
