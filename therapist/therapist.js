// toggle sections

// Function to toggle the sliding panels
function toggleSlideDoc(contentIdDoc) { 
    // First, close any open panels and disable settings
    const allPanelsDoc = document.querySelectorAll('.slidingDocContent' );
    allPanelsDoc.forEach(panel => {
      panel.classList.remove('active');
    });
  
    // Then, toggle the clicked panel
    const contentDoc = document.getElementById(contentIdDoc);
    contentDoc.classList.toggle('active');
  
    // Close settings if it's open
    const settingsContentDoc = document.querySelector('.settingsDocContent');
    settingsContentDoc.classList.remove('active');
  }
  
  // Function to toggle the settings content
  function toggleSettingsDoc() {
    // Close any open panels
    const allPanelsDoc = document.querySelectorAll('.slidingDocContent');
    allPanelsDoc.forEach(panel => {
      panel.classList.remove('active');
    });
  
    // Toggle the settings content
    const content2Doc = document.querySelector('.settingsDocContent');
    content2Doc.classList.toggle('active');
  }
  
  //For the appointment section
  function toggle1(){
    
    var popup=document.getElementById('popupPat')
    popup.classList.toggle('active')
    var parent=document.querySelector('.TheContentPatContainer')
    parent.classList.toggle('active')
  
  }
  
  //for the appointment table section
  
  
  
   function toggle2(){
    var popup2=document.querySelector('.upcoming')
    popup2.classList.toggle('active')
    var parent=document.querySelector('.TheContentPatContainer')
    parent.classList.toggle('active')
  }
  
  
  
  //for account updates
   //for the appointment table section
  function toggle4() {
    // Select the modal and parent div
    var popup3 = document.querySelector('.modalDoc');
    var parent = document.querySelector('.settingsDocContent');
  
    // Toggle the active class on the modal
    popup3.classList.toggle('active');
  
    // If the modal is active, add the blur effect to the parent and change its class to .blur
    if (popup3.classList.contains('active')) {
      parent.classList.add('blur');  // Add blur effect
      parent.classList.remove('active'); // Remove the active class, if necessary
    } else {
      parent.classList.remove('blur'); // Remove blur effect
      parent.classList.add('active');  // Add back active class, if necessary
    }
  }
  
  
  //Log out section
  
  function logoutDoc() {
    // Remove user session from sessionStorage
    sessionStorage.removeItem('userSession'); 
  
    // Clear the cookie if used for session info
    document.cookie = 'userSession=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;';
  
    // Redirect to login page or home page
    window.location.href = 'http://127.0.0.1:5500/portal.html'; // or your homepage URL
  }