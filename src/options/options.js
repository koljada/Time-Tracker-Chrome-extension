
document.addEventListener('DOMContentLoaded', async function () {
    const select = document.getElementById('timezone');
    const workHours = document.getElementById('work-hours');

    workHours.value = await storage.workHours.get();

    const zones = moment.tz.names();

    const defaultZone = await storage.timezone.get();

    zones.forEach(x => {
        const opt = document.createElement('option');
        opt.value = x;
        opt.text = x;
        if (x === defaultZone) {
            opt.selected = true;
        }
        select.appendChild(opt);
    });

    select.addEventListener('change', async (event) => await storage.timezone.set(event.target.selectedOptions[0].value));

    workHours.addEventListener('change', async (event) => await storage.workHours.set(event.target.value));
});
