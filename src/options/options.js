
document.addEventListener('DOMContentLoaded', async function () {
    const select = document.getElementById('timezone');
    const workHours = document.getElementById('work-hours');

    workHours.value = await getWorkHours();

    var zones = moment.tz.names();

    var defaultZone = await getTimezone();

    zones.forEach(x => {
        var opt = document.createElement('option');
        opt.value = x;
        opt.text = x;
        if (x === defaultZone) {
            opt.selected = true;
        }
        select.appendChild(opt);
    });

    select.addEventListener('change', async (event) => await setTimezone(event.target.selectedOptions[0].value));

    workHours.addEventListener('change', async (event) => await setWorkHours(event.target.value));
});