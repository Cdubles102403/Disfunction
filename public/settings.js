//logout
function die() {
    const areYouSure = confirm("Are you sure you want to log out?");
  
    if (areYouSure) {
      Cookies.remove('token')
      window.location.assign("/signup.html");
    }
  }
  