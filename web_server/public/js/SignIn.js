$(function () {

    $('.loginForm').on('submit', function (e) {
        e.preventDefault(); // prevents page reloading
        $.ajax({
            url:'/signin',
            type: 'POST',
            data: {"username" : $(".usernameInput").val(),
                "password" : $(".passwordInput").val()
            },
            dataType: 'text',
            success: function (data){
                let parsed = JSON.parse(data);
                if (parsed.roles.includes("ROLE_ADMIN")) window.location='/admin';
                else window.location='/user';
                }
            //TODO: Rajouter les vérifications nécessaires et correctement alerter l'utilisateur
            // ON success, fail etc....
        });
        $('.loginForm input').val('');
        return false;
    });

});