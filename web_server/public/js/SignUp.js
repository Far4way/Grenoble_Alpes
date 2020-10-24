$(function () {

    $('.loginForm').on('submit', function (e) {
        e.preventDefault(); // prevents page reloading
        let admin = $(".roleInput").is(':checked');
        let roles;
        if (admin) roles = ["user","admin"];
        else roles = ["user"];
        if ($(".passwordInput").val() === $(".passwordConfirmInput").val()){
            $.ajax({
                url:'/signup',
                type: 'POST',
                data: {"username" : $(".usernameInput").val(),
                    "password" : $(".passwordInput").val(),
                    "roles" : roles
                },
                dataType: 'text'
            });
            $('.loginForm input').val('');
        } else {
            //TODO: Rajouter les vérifications nécessaires et correctement alerter l'utilisateur
            // ON success, fail etc....
            console.log("PASSWORDS NOT MATCHING");
        }
        return false;
    });

});