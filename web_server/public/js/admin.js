let wellGroups = ["maroon", "red", "purple", "fuchsia", "green", "lime", "olive", "yellow", "navy", "blue", "teal", "aqua"];
let groupUsed = [false, false, false, false, false, false, false, false, false, false, false, false];
let experienceState;

//TODO : actions boutons pause, continue et stop the experience!.

$(function () {
    $('#experienceEndCalendar').datetimepicker();
    $('#stepEndCalendar').datetimepicker();
    let socket = io.connect({
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: Infinity
    });
    let isMouseDown = false;
    let isHighlighted;
    let expId;
    let stepId;
    let username;
    $("#experienceControlStart, #secondStep, #thirdStep, #startExperienceButton, #stopExperienceButton, #pauseExperienceButton, #continueExperienceButton, #addStepButton").hide();
    socket.once('connect', () => {
        socket.emit("greetings", Cookies.get('userId'), Cookies.get('username'));
        username = Cookies.get('username');
        socket.emit('getStateExperience');
        socket.on('serverResponse', function (data) {
            console.log(data);
            $(".consoleHistory").append(data + "<br>");
            updateScroll();
        });

        // handle the event sent with socket.send()
        socket.on('message', function (data) {
            $("#Robert").html("Message received: " + data);
        });

        socket.on('newExperience', function (exp) {
            expId = exp._id;
            $('#firstStep').hide(250, function () {
                $('#secondStep').show(250);
            });
        });

        socket.on('newStep', function (step) {
            stepId = step._id;
            $('#secondStep').hide(250, function () {
                $('#thirdStep').show(250);
            });
        });

        socket.on('startExperiment', function (experience, user) {
            experienceState = "running";
            updateExperienceStatus();
            $('#experienceName').html(experience.name);
            $('#experienceNumber').html(experience.number);
            $('#experienceUser').html(user);
            $('#experienceStartDate').html(experience.startTime);
            $('#experienceEndDate').html(experience.stopTime);
            $('#inputExperienceNumber').val(experience.number + 1);
            $('#experienceControlStart').hide(250, function () {
                $('#experienceControlStatus').show(250);
            });
            $('#thirdStep').hide(250, function () {
                $('#firstStep').show(250);
            });
            resetFormsControl();
        });

        socket.on('stopExperiment', function (expState, experience) {
            experienceState = expState;
            updateExperienceStatus();
            $('#experienceName').html(experience.name);
            $('#experienceNumber').html(experience.number);
            $('#experienceUser').html(username);
            $('#experienceStartDate').html(experience.startTime);
            $('#experienceEndDate').html(experience.stopTime);
            $('#inputExperienceNumber').val(experience.number + 1);
        });

        socket.on('pauseExperiment', function (expState, experience) {
            experienceState = expState;
            updateExperienceStatus();
            $('#experienceName').html(experience.name);
            $('#experienceNumber').html(experience.number);
            $('#experienceUser').html(username);
            $('#experienceStartDate').html(experience.startTime);
            $('#experienceEndDate').html(experience.stopTime);
            $('#inputExperienceNumber').val(experience.number + 1);
        });

        socket.on('startStep', function (expState, experience, step) {
            experienceState = expState;
            updateExperienceStatus();
            $('#experienceName').html(experience.name);
            $('#experienceNumber').html(experience.number);
            $('#experienceUser').html(username);
            $('#experienceStartDate').html(experience.startTime);
            $('#experienceEndDate').html(experience.stopTime);
            $('#inputExperienceNumber').val(experience.number + 1);
            stepId = step._id;
        });

        socket.on('continueExperiment', function (expState, experience, step) {
            experienceState = expState;
            updateExperienceStatus();
            $('#experienceName').html(experience.name);
            $('#experienceNumber').html(experience.number);
            $('#experienceUser').html(username);
            $('#experienceStartDate').html(experience.startTime);
            $('#experienceEndDate').html(experience.stopTime);
            $('#inputExperienceNumber').val(experience.number + 1);
            stepId = step._id;
        });

        socket.on('disconnect', function (reason) {
            console.log('disconnected from server');
        });

        socket.on('firstExperience', function (expState) {
            experienceState = expState;
            updateExperienceStatus();
            $('#inputExperienceNumber').val(1);

        });

        socket.on('getStateExperience', function (expState, experience, user) {
            experienceState = expState;
            updateExperienceStatus();
            $('#experienceName').html(experience.name);
            $('#experienceNumber').html(experience.number);
            $('#experienceUser').html(user);
            $('#experienceStartDate').html(experience.startTime);
            $('#experienceEndDate').html(experience.stopTime);
            $('#inputExperienceNumber').val(experience.number + 1);
        });

        socket.on('newWellsGroup', function (wells) {
            let well0 = wells[0];
            let groupName = well0.group;
            let base = "<li class='" + groupName + "'> <div> <span>" + groupName + " : " + wells.length + " Wells </span> <div><ul></ul></div> </div> </li>";
            let list = $('#listGroups');
            let selectedWell = $('#wellsArray td.highlighted');
            let indexGroup = 0;
            groupUsed.some(function (element, index) {
                if (element === false) {
                    indexGroup = index;
                    return true;
                }
                return false;
            });
            selectedWell.each(function () {
                $(this).toggleClass("highlighted");
                $(this).addClass(groupName);
                $(this).children().css("background-color", wellGroups[indexGroup]);
            });
            groupUsed[indexGroup] = groupName;
            list.append(base);
            updateNumberWellSelected()
        });

        socket.on('deleteWellsGroups', function () {
            groupUsed.fill(false, 0, 12);
            $('#wellsArray td').removeClass();
            $('#wellsArray td div').css("background-color", "");
            $('#listGroups').html('');
            $('#listWells').html('');
            $('#inputGroupSelected').val('');
        });

        socket.on('newProductWells', function (product) {
            let groupSelection = $('#inputGroupSelected');
            let inputProductConcentration = $('#inputProductConcentration');
            let inputProductVolume = $('#inputProductVolume');
            let inputProductName = $('#inputProductName');
            $('li.' + groupSelection.val() + ' ul').append("<li>" + product.volume + " of " + product.name + " at " + product.concentration + "</li>");
            inputProductName.val('');
            inputProductConcentration.val('');
            inputProductVolume.val('');
        });


        $('#inputGroupSelected').val('');
        $('.consoleInput').on('submit', function (e) {
            e.preventDefault(); // prevents page reloading
            socket.emit('consoleInput', $(".consoleInput input").val());
            $('.consoleInput input').val('');
            console.log(socket);

            return false;
        });

        $('#startExperienceButton').on('click', function () {
            $('#experienceControlStatus').hide(250, function () {
                $('#experienceControlStart').show(250);
            });
        });

        $('.experienceForm #firstStep').on('submit', function (e) {
            e.preventDefault();
            let number = $('#inputExperienceNumber').val();
            let nameInput = $('#inputExperienceName');
            let name = nameInput.val();
            let startTime = new Date();
            let endTime = $('#experienceEndCalendar').datetimepicker('getValue');
            let endDate = null;
            if (endTime !== null) {
                endDate = new Date(endTime);
            }
            let measures = 0;
            if (name === '') {
                nameInput.parent().append('<svg class="p-0 col-1 bi" width="32" height="32" color="red"> <use xlink:href="bootstrap-icons.svg#exclamation-circle"/>');
                nameInput.css("border", "red solid 1px");
                return false;
            }
            $('#firstStep .form-check-input:checked').each(function () {
                measures += parseInt($(this).val());
            });
            let measurementDelay = parseInt($('#inputMeasurementDelay').val());
            socket.emit('newExperience', number, name, startTime, endDate, measures, measurementDelay);
        });

        $('.experienceForm #secondStep').on('submit', function (e) {
            e.preventDefault();
            let temperatureInput = $('#inputStepTemperature');
            let humidityInput = $('#inputStepHumidity');
            let agitationInput = $('#inputStepAgitation');
            let temperature = temperatureInput.val();
            let humidity = humidityInput.val();
            let agitation = agitationInput.val();
            let endTime = $('#stepEndCalendar').datetimepicker('getValue');
            let endDate = null;
            if (endTime !== null) {
                endDate = new Date(endTime);
            }
            if (temperature === '') {
                temperatureInput.parent().append('<svg class="p-0 col-1 bi" width="32" height="32" color="red"> <use xlink:href="bootstrap-icons.svg#exclamation-circle"/>');
                temperatureInput.css("border", "red solid 1px");
                return false;
            }
            if (humidity === '') {
                humidityInput.parent().append('<svg class="p-0 col-1 bi" width="32" height="32" color="red"> <use xlink:href="bootstrap-icons.svg#exclamation-circle"/>');
                humidityInput.css("border", "red solid 1px");
                return false;
            }
            if (agitation === '') {
                agitationInput.parent().append('<svg class="p-0 col-1 bi" width="32" height="32" color="red"> <use xlink:href="bootstrap-icons.svg#exclamation-circle"/>');
                agitationInput.css("border", "red solid 1px");
                return false;
            }

            socket.emit('newStep', parseFloat(temperature), parseFloat(humidity), parseFloat(agitation), endDate, expId)

        });


        $('#resetWellsArray').on('click', function () {
            $("#wellsArray td").each(function () {
                $(this).removeClass("highlighted");
            });
            updateNumberWellSelected();
        });

        $('#addWellsGroup').on('click', function () {
            let inputName = $('#inputGroupName');
            let name = $(inputName).val();
            name = name.replace(/\s+/g, '_');
            if ($('#inputNumberWellSelected').val() !== '0') addWellGroupToList(name);
            $(inputName).val('');
        });

        $('#resetWellsGroups').on('click', function () {
            //TODO : Remove from database
            socket.emit('deleteWellsGroups', stepId);
        });

        $("#wellsArray th[data-column]:not([data-column='-1'])").on('click', function () {
            let column = $(this).attr('data-column');
            $('#wellsArray td[data-column=' + column + ']').each(function () {
                let elem = $(this).get()[0];
                if (elem.classList.length === 2 || (elem.classList.length === 1 && !$(this).hasClass("highlighted"))) return;
                $(this).toggleClass("highlighted");
                updateNumberWellSelected();
            });
        });

        $("#wellsArray tr[data-line]:not([data-line='-1']) th").on('click', function () {
            $(this).parent().children('td').each(function () {
                let elem = $(this).get()[0];
                if (elem.classList.length === 2 || (elem.classList.length === 1 && !$(this).hasClass("highlighted"))) return;
                $(this).toggleClass("highlighted");
            });
            updateNumberWellSelected();
        });

        $("#wellsArray td")
            .on('mousedown', function () {
                let elem = $(this).get()[0];
                if (elem.classList.length === 2 || (elem.classList.length === 1 && !$(this).hasClass("highlighted"))) return false;
                isMouseDown = true;
                $(this).toggleClass("highlighted");
                updateNumberWellSelected();
                isHighlighted = $(this).hasClass("highlighted");
                return false; // prevent text selection
            })
            .on('mouseover', function () {
                if (isMouseDown) {
                    let elem = $(this).get()[0];
                    if (elem.classList.length === 2 || (elem.classList.length === 1 && !$(this).hasClass("highlighted"))) return false;
                    $(this).toggleClass("highlighted", isHighlighted);
                    updateNumberWellSelected();
                }
            })
            .on('bind', "selectstart", function () {
                return false;
            });

        $(document).on('mouseup', function () {
            isMouseDown = false;
        });

        $('#listGroups').on('click', 'li', function () {
            let group = $(this).attr('class');
            let groupSelection = $('#inputGroupSelected');
            groupSelection.css('border', '');
            $('.errorAddProduct').each(function () {
                $(this).remove();
            });
            $(this).parent().children().css('font-weight', '');
            $(this).css('font-weight', 'bold');
            groupSelection.val(group);
            let str = '';
            $('#wellsArray td.selected').toggleClass('selected');

            $('#wellsArray td.' + group).each(function () {
                let column = $(this).index();
                let line = String.fromCharCode(64 + $(this).parent().index());
                $(this).toggleClass('selected');
                str += "<span> (" + line + "," + column + ")</span>, ";
            });
            $('#listWells').html(str.slice(0, -2));
            //TODO : GET FROM DATABASE ?
        });

        $('#addProductToGroup').on('click', function () {
            let groupSelection = $('#inputGroupSelected');
            let inputProductConcentration = $('#inputProductConcentration');
            let inputProductVolume = $('#inputProductVolume');
            let inputProductName = $('#inputProductName');
            if (groupSelection.val() === '') {
                groupSelection.css('border', 'red 1px solid');
                groupSelection.parent().parent().append("<div class='errorAddProduct'> <p class='text-danger'>Select a group first!</p> </div>");
                return false;
            }
            socket.emit('newProductWells', groupSelection.val(), inputProductName.val(), inputProductConcentration.val(), inputProductVolume.val(), stepId);
        });

        $('#startExperiment').on('click', function () {
            socket.emit('startExperiment', expId);
        });

        $('#pauseExperienceButton').on('click', function () {
            if (experienceState === "running")
                socket.emit('pauseExperiment', expId);
        });

        $('#stopExperienceButton').on('click', function () {
            if (experienceState !== "stopped")
                socket.emit('stopExperiment', expId);
        });

        $('#continueExperienceButton').on('click', function () {
            if (experienceState === "paused")
                socket.emit('continueExperiment', expId);
        });

        $('#addStepButton').on('click', function () {
            if (experienceState === "paused") {
                $('#experienceControlStatus').hide(250, function () {
                    $('#experienceControlStart').show(250);
                });
                $('#firstStep').hide(250, function () {
                    $('#secondStep').show(250);
                });
            }
        });

        function addWellGroupToList(groupName) {
            let selectedWell = $('#wellsArray td.highlighted');
            let indexGroup = null;
            groupUsed.some(function (element, index) {
                if (element === false) {
                    indexGroup = index;
                    return true;
                }
                return false;
            });
            if (groupName === '') groupName = 'group' + (indexGroup + 1);

            while (groupUsed.includes(groupName)) groupName += '_';

            let wellList = [];

            selectedWell.each(function () {
                let column = parseInt($(this).index());
                let line = parseInt($(this).parent().index());
                let well = { group: groupName, column: column, line: line };
                wellList.push(well);
            });
            socket.emit('newWellsGroup', stepId, wellList);
            updateNumberWellSelected();
        }

    });
    socket.on('reconnect', () => {
        socket.emit("greetings", Cookies.get('userId'), Cookies.get('username'));
    });
});


function updateExperienceStatus() {
    let statusButton = $('#experienceStatusButton');
    statusButton.removeClass("btn-success");
    statusButton.removeClass("btn-warning");
    statusButton.removeClass("btn-danger");
    switch (experienceState) {
        case "running":
            statusButton.toggleClass("btn-success");
            statusButton.text("Running");
            $('#pauseExperienceButton, #stopExperienceButton').show();
            $('#continueExperienceButton, #startExperienceButton, #addStepButton').hide();
            break
        case "stopped":
            statusButton.toggleClass("btn-danger");
            statusButton.text("Stopped");
            $('#startExperienceButton').show();
            $('#continueExperienceButton, #pauseExperienceButton, #stopExperienceButton, #addStepButton').hide();
            break
        case "paused":
            statusButton.toggleClass("btn-warning");
            statusButton.text("Paused");
            $('#pauseExperienceButton, #startExperienceButton').hide();
            $('#continueExperienceButton, #stopExperienceButton, #addStepButton').show();
    }
}

function updateScroll() {
    let d = $(".consoleHistoryWrapper");
    d.scrollTop(d.prop("scrollHeight"));
};

function updateNumberWellSelected() {
    let nmber = $('#wellsArray td.highlighted').length;
    $('#inputNumberWellSelected').val(nmber);
};

function resetFormsControl() {
    $('#inputExperienceName').val('');
    $('#firstStep .form-check-input:checked').each(function () {
        $(this).prop("checked", true);
    });
    $('#inputMeasurementDelay').val("30");
    $('#inputStepTemperature').val("37.0");
    $('#inputStepHumidity').val("100.0");
    $('#inputStepAgitation').val("90");

    groupUsed.fill(false, 0, 12);
    $('#wellsArray td').removeClass();
    $('#wellsArray td div').css("background-color", "");
    $('#listGroups').html('');
    $('#listWells').html('');
    $('#inputGroupSelected').val('');
    updateNumberWellSelected();
    $('#inputProductName').val('');
    $('#inputProductVolume').val('');
    $('#inputProductConcentration').val('');
};