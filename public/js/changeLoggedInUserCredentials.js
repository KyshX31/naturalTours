 // import axios from 'axios';
import { showAlert } from "/js/alerts.js";


 console.log("This file is fucking running.")
 console.log("Testing if script loads without import...")



const saveSettingsButton = document.querySelector(".btn.btn--small.btn--green");

const url = `http://localhost:3000/api/v1/users/updateMe`;


saveSettingsButton.addEventListener("click", async e=>{
e.preventDefault();
console.log("maine touch kiya")
const form = new FormData();
const name = document.querySelector("#name").value;
const emailAddress = document.querySelector("#email").value;
const photo = document.querySelector("#photo").files[0];

form.append("name", name);
form.append("email", emailAddress);
form.append("photo", photo);

console.log("The user update form is:🐫🐫🐫🐫🐫🐫🐫🐫🐫🐫🐫🐫🐫🐫🐫🐫🐫🐫🐫", form);

const response = await axios({
    method: "PATCH",
    url,
    data: form
});

if(response.data.status==='success'){
    showAlert('success','Data updated successfully');
    // Refresh the page after 2 seconds
    setTimeout(() => {
        window.location.reload();
    }, 2000);
}

else{
    showAlert('error', 'couldnot update')
}
console.log("response from the server is: 🦕🦕🦕🦕🦕🦕🦕🦕🦕🦕🦕🦕🦕🦕🦕🦕🦕🦕🦕", response);
//
})





