function addMember(){
    let token = Cookies.get("token");
    let room = $("select#rooms").val()
    let member=$("#memberToAdd").val()
    let payload = {
        body: JSON.stringify({
          token: token,
          room: room,
          member: member,
        }),
        method: "post",
        headers: {
          "content-type": "application/json",
        },
      };

  
      fetch("/addMember", payload)
        .then((res) => res.json())
        .then(res=>{console.log(res)})
}

