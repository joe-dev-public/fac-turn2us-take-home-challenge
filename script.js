'use strict';

const formEl = document.querySelector('form');
const dateOfBirthInputEl = document.querySelector('input[name="dateOfBirth"]');
const mainEl = document.querySelector('main');
const errMsgEl = document.querySelector('.error-message');


// Stretch goal: validate input (to some extent) as it's typed? (i.e. don't allow certain keys)
dateOfBirthInputEl.addEventListener('keydown', (event) => {

    // We need to use the keydown even to get the keycode, I think.
    // Stealing keydown events maybe isn't the best approach! Nothing built-in to browser?

    const keycode = event.code;

    //console.log(keycode);

    // Digit[0-9], Numpad[0-9], Slash, etc. are OK
    const reDigit = new RegExp(/^Digit[0-9]$/);
    const reNumpad = new RegExp(/^Numpad[0-9]$/);
    const reSlash = new RegExp(/^(Slash|NumpadDivide)$/);
    const reOthers = new RegExp(/^(Backspace|Delete|Enter|NumpadEnter|Tab|Home|End|ArrowLeft|ArrowRight|ShitLeft|ShiftRight|ControlLeft|ControlRight)$/);

    if (
        reDigit.test(keycode) === false &&
        reNumpad.test(keycode) === false &&
        reSlash.test(keycode) === false &&
        reOthers.test(keycode) === false
    ) {
        event.preventDefault();
    }

});


// Stretch goal (not done): format/constrain input as it's typed (as Turn2us form does)
dateOfBirthInputEl.addEventListener('input', (event) => {

    // Is it better to use the input event for validation?
    // (Which will look at the whole value entered so far, not just the keys being pressed.)

    /*  Validation: allow
            [0-3][0-9] or [01-31] /
            [0-1][0-9] or [01-12] /
            \d\d\d\d (just any four digits)

        preventDefault if the keys pressed aren't numbers or / ?
        (Could the browser handle this for us, e.g. input type=date with the date-picker
        suppressed?)
    */

    /*
        Formatting:
            - If the value is an empty string, clicking in the input should show placeholder
                - (That'll probably require a different event, like click or focus)
            - For the input event, set the input equal to whatever it was, plus the rest of
                the placeholder text (__/__/____)
    */

    // event.target.value = '__/__/____';

});


function validationErrorMessage() {
    errMsgEl.innerText = 'Please enter your date of birth in the format dd/mm/yyyy';
    errMsgEl.classList.remove('hidden');
}


function successMessage() {
    const html = `<h2>You're eligible to apply</h2>`;
    mainEl.innerHTML = html;
}


function tooYoungMessage() {
    const html = `<h2>Sorry, you're not eligible to apply</h2><p>You have to be at least 18 years old to apply.</p>`;
    mainEl.innerHTML = html;
}


function isUser18OrOver(ddOfBirth, mmOfBirth, yyyyOfBirth) {

    const birthDate = new Date(`${yyyyOfBirth}-${mmOfBirth}-${ddOfBirth}`);
    const [birthYear, birthMonth, birthDay] = [birthDate.getFullYear(), birthDate.getMonth() + 1, birthDate.getDate()];

    const nowDate = new Date();
    const [nowYear, nowMonth, nowDay] = [nowDate.getFullYear(), nowDate.getMonth() + 1, nowDate.getDate()];

    // Not particularly elegant, but I think it works!

    if ((nowYear - birthYear) < 18) {
        // Age is definitely under 18
        return false;
    } else if ((nowYear - birthYear) === 18) {
        // Age *could* be 18, or 17
        if (birthMonth < nowMonth) {
            // Birth month is earlier in the year than current month, so age must be 18
            return true;
        } else if (birthMonth > nowMonth) {
            // Birth month is later in year than current month, age must be under 18
            return false;
        } else if (birthMonth === nowMonth) {
            // Birth month is the same as current month, age could be 18, check day(/date):
            if (birthDay <= nowDay) {
                // Birth day is earlier in month than/equal to current date, must be 18
                return true;
            } else {
                // Birth day is later in month than current date, must be under 18
                return false;
            }
        }
    } else if ((nowYear - birthYear) > 18) {
        // Age is definitely over 18
        return true;
    }


}


function handleFormInput() {

    const myFormData = new FormData(formEl);
    const dateOfBirth = Object.fromEntries(myFormData)['dateOfBirth'];

    errMsgEl.classList.add('hidden');

    // Do validation here?
    // Regex to test for valid date:
    // const re = new RegExp(/^\d\d\/\d\d\/\d\d\d\d$/);

    // Split the input string up by /, and convert each segment to a number before assigning.
    const [ddOfBirth, mmOfBirth, yyyyOfBirth] = dateOfBirth.split('/').map(n => Number(n));

    // Quick bit of validation:
    if (ddOfBirth === 0 || mmOfBirth === 0 || yyyyOfBirth === 0) {
        validationErrorMessage();
        return;
    }
    // (pattern attribute in HTML actually handles it OK, so this is just an example)

    if (isUser18OrOver(ddOfBirth, mmOfBirth, yyyyOfBirth)) {
        successMessage();
    } else {
        tooYoungMessage();
    }

}


formEl.addEventListener('submit', (event) => {
    event.preventDefault();
    // Check the age
    handleFormInput();
});


/*
function brokenAgeCalc(ddOfBirth, mmOfBirth, yyyyOfBirth) {

    // The ms method doesn't work because ages are calculated by calendar date, not "actual age"!

    //  Calculate the age (just roughly for now):
    //      - In a real system, we'd maybe use a well-tested library to do this.
    //      - Here, we'll code an approximation from scratch that's "good enough".
    //      - (i.e. if today is your 18th birthday or later, you're 18)
    

    // Number of ms between epoch (January 1, 1970 00:00:00 UTC) and DOB:
    const msBetweenDOBAndEpoch = Date.parse(`${yyyyOfBirth}-${mmOfBirth}-${ddOfBirth}`);
    // (It's negative if DOB is before epoch.)

    // Number of ms between epoch and now:
    const msSinceEpoch = Date.now();

    // We don't need to check sign of msBetweenDOBAndEpoch, as double negatives cancel.
    const ageInMs = msSinceEpoch - msBetweenDOBAndEpoch;

    //Number of ms in one year:
    //      - Roughly; mean number of days per year in Gregorian calendar is 365.2425
    //          (src: https://en.wikipedia.org/wiki/Gregorian_calendar)
    //      - 1000ms in 1s; 60s in 1min; 60min in 1h; 24h in 1day; ~365days in 1 year
    const numberOfMsInYear = 1000 * 60 * 60 * 24 * 365.2425;

    // We only need the integer:
    const ageInYears = Math.floor(ageInMs / numberOfMsInYear);
    //const ageInYears = ageInMs / numberOfMsInYear;

    console.log(ageInYears);

}
*/