import "../src/scss/styles.scss";

("use strict");
import {
    account1,
    account2,
    account3,
    account4,
    account5,
    account6,
    accounts,
} from "./data.js";

// Testing Modules
console.log(account2);
console.log(account3);
console.log(accounts);

const labelWelcome = document.querySelector(".nav__welcome");
const labelDate = document.querySelector(".balance__info--date--span");
const labelBalance = document.querySelector(".balance__value");
const labelSumIn = document.querySelector(".summary__value--in");
const labelSumOut = document.querySelector(".summary__value--out");
const labelSumInterest = document.querySelector(".summary__value--interest");
const labelTimer = document.querySelector(".timer");

const containerApp = document.querySelector(".main");
const containerMovements = document.querySelector(".movements");

const btnLogin = document.querySelector(".nav__form--btn");
const btnTransferMoney = document.querySelector(".form__btn--transfer");
const btnLoanMoney = document.querySelector(".form__btn--loan");
const btnDeleteAccount = document.querySelector(".form__btn--close");
const btnSort = document.querySelector(".btn--sort");

const inputLoginUsername = document.querySelector(".nav__form__user--input");
const inputLoginPin = document.querySelector(".nav__form__pin--input");
const inputTransferTo = document.querySelector(".form__input--to");
const inputTransferAmount = document.querySelector(".form__input--amount");
const inputLoanAmount = document.querySelector(".form__input--loan-amount");
const inputCloseUsername = document.querySelector(".form__input--user");
const inputClosePin = document.querySelector(".form__input--pin");

///////////////////////////////////////
///////////////////////////////////////

const formatCurrency = function (value, locale, currency) {
    return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: currency,
    }).format(value);
};

const formatMovementDate = function (date, locale) {
    // 1.0 Function to create the timestamp for days passed
    // 1.1 We take Date1, and Date2, we turn them into Timestamp numbers (1 Day = 86400000)
    // 1.2 Then we subtract the Timestamp Numbers and / with the amount of 1 Day in Timestamp
    // to get the results of how many days have passed
    const calcDaysPassed = (date1, date2) =>
        Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

    const daysPassed = calcDaysPassed(new Date(), date);
    // console.log(daysPassed);

    if (daysPassed === 0) return "Today";
    if (daysPassed === 1) return "Yesterday";
    if (daysPassed <= 7) return `${daysPassed} days ago`;
    // ❌
    // 2.0 We extract the date, month and year from the passed Date into this function
    // const day = `${date.getDate()}`.padStart(2, 0);
    // const month = `${date.getMonth() + 1}`.padStart(2, 0);
    // const year = date.getFullYear();
    // 3.0 We format the date so that it looks like this, 09/05/2023
    // return `${day}/${month}/${year}`;
    return new Intl.DateTimeFormat(locale).format(date);
};

const displayMovements = function (acc, sort = false) {
    const [movs, dates] = sort
        ? sortMovements(acc.movements, acc.movementsDates)
        : [acc.movements, acc.movementsDates];

    // const movs = sort
    /////   ? acc.movements.slice().sort((a, b) => a - b)
    //   : acc.movements;

    movs.forEach(function (movementValue, index) {
        const type = movementValue > 0 ? "deposit" : "withdrawal";

        const date = new Date(dates[index]);
        // const date = new Date(acc.movementsDates[index]);
        const displayDate = formatMovementDate(date, acc.locale);

        const displayCurrency = formatCurrency(
            movementValue,
            acc.locale,
            acc.currency
        );

        const html = `
          <div class="movements__row">
            <div class="movements__row__type  movements__row--${type}">${
            index + 1
        } ${type}</div>
            <div class="movements__row--date">${displayDate}</div>
            <div class="movements__row--value">${displayCurrency}</div>
          </div>
      `;

        // new Intl.NumberFormat(arrayOfAccounts.locale, {
        //   style: "currency",
        //   currency: arrayOfAccounts.currency,
        // }).format(movementValue);

        // const html = `
        //     <div class="movements__row">
        //       <div class="movements__row__type movements__row__type--${type}">${
        //   index + 1
        // } ${type}</div>
        //       <div class="movements__date">${displayDate}</div>
        //       <div class="movements__value">${movementValue.toFixed(2)}€</div>
        //     </div>
        // `;

        containerMovements.insertAdjacentHTML("afterbegin", html);
    });
};

///////////////////////////////////////
///////////////////////////////////////

const calcDisplaySummary = function (acc) {
    const Incomes = acc.movements
        .filter((mov) => mov > 0)
        .reduce((acc, mov) => acc + mov, 0);
    labelSumIn.textContent = formatCurrency(Incomes, acc.locale, acc.currency);

    const out = acc.movements
        .filter((mov) => mov < 0)
        .reduce((acc, curr) => acc + curr, 0);
    labelSumOut.textContent = formatCurrency(
        Math.abs(out),
        acc.locale,
        acc.currency
    );

    const interest = acc.movements
        .filter((param1) => param1 > 0)
        .map((param2) => (param2 * acc.interestRate) / 100)
        .filter((param3, i, arr) => {
            return param3 >= 1;
        })
        .reduce((param4, param5) => param4 + param5, 0);
    labelSumInterest.textContent = formatCurrency(
        interest,
        acc.locale,
        acc.currency
    );
};

///////////////////////////////////////
///////////////////////////////////////

const createUserNames = function (arrayOfAccounts) {
    arrayOfAccounts.forEach(function (arrayElement) {
        arrayElement.username = arrayElement.owner
            .toLowerCase() // 'harun jonuzi'
            .split(" ") // ['harun', 'jonuzi']
            .map((name) => name[0]) // ['h', 'j']
            .join(""); // hj
    });
};
createUserNames(accounts);

///////////////////////////////////////
///////////////////////////////////////

const updateUseInterfaceData = function (acc) {
    displayMovements(acc);
    displayBalance(acc);
    calcDisplaySummary(acc);
};

const loginDecreaseOpacity = function () {
    containerApp.style.opacity = 0;
    labelWelcome.textContent = `Log in to get started`;
};

const loginIncreaseOpacity = function () {
    containerApp.style.opacity = 100;
    labelWelcome.textContent = `Welcome ${currentAccount.owner.split(" ")[0]}`;
};

///////////////////////////////////////
///////////////////////////////////////

const startLogoutTimer = function () {
    // We implement the function this way
    // because setInterval starts 1000ms after
    // the function is run, and we don't want that
    // we want to make it run asap, so we run tick()
    // first and then the 1000ms starts
    const tick = function () {
        const min = String(Math.trunc(time / 60)).padStart(2, 0);
        const sec = String(time % 60).padStart(2, 0);

        labelTimer.textContent = `${min}:${sec}`;

        if (time === 0) {
            clearInterval(timer);
            loginDecreaseOpacity();
        }

        time--;
    };

    let time = 120;
    tick();
    const timer = setInterval(tick, 1000);

    return timer;
};

///////////////////////////////////////
///////////////////////////////////////

let currentAccount, timer;

///////////////////////////////////////
///////////////////////////////////////

const displayBalance = function (acc) {
    // add balance to account objects
    acc.balance = acc.movements.reduce(function (
        accumulator,
        currValue,
        currIndex
    ) {
        accumulator = accumulator + currValue;
        return accumulator;
    },
    0);

    labelBalance.textContent = `${formatCurrency(
        acc.balance,
        acc.locale,
        acc.currency
    )}`;
};

///////////////////////////////////////
///////////////////////////////////////

btnLogin.addEventListener("click", function (e) {
    e.preventDefault();

    // find() method returns whole object when finding 1 matching element
    currentAccount = accounts.find(
        (acc) => acc.username === inputLoginUsername.value
    );

    if (currentAccount?.pin === Number(inputLoginPin.value)) {
        loginIncreaseOpacity();

        if (timer) clearInterval(timer);
        timer = startLogoutTimer();

        // window.location.href = "/user-interface.html";
        // reason we add date in login button is to have
        // the displayed time equal to login time

        // * Internationalization API Usage
        const newDate = new Date();
        const options = {
            hour: "numeric",
            minute: "numeric",
            day: "numeric", // we have to specify this and then change it with weekday
            month: "numeric",
            year: "numeric",
            // weekday: "long", // Saturday, we can also use short, narrow
            // month: "numeric",
            // year: "2-digit",
        };

        // Check what lang we use in our browser and use that in API
        // const locale = currentAccount.locale;
        // console.log(locale);

        // Great Britain
        labelDate.textContent = new Intl.DateTimeFormat(
            currentAccount.locale,
            options
        ).format(newDate); // Day/Month/Year Hour:Min

        // ❌
        // const day = `${newDate.getDate()}`.padStart(2, 0);
        // const month = `${newDate.getMonth() + 1}`.padStart(2, 0); // +1 because starts from 0
        // const year = newDate.getFullYear();
        // const hour = `${newDate.getHours()}`.padStart(2, 0);
        // const min = `${newDate.getMinutes()}`.padStart(2, 0);
        // Add date to UI
        // labelDate.textContent = `${day}/${month}/${year}, ${hour}:${min}`;

        // Update & Clear fields
        updateUseInterfaceData(currentAccount);
        inputLoginUsername.value = inputLoginPin.value = "";
        inputLoginPin.blur();
    }

    // if you leave input fields empy
    // else if (inputLoginUsername.value === "" && inputLoginPin.value === "") {
    //   const errorElements = document.querySelectorAll("p.error");

    //   for (let i = 0; i < errorElements.length; i++) {
    //     errorElements[i].innerHTML = "Don't leave this empty!";
    //   }
    // } else {
    //   console.log("❌ Wrong Pin");
    // }
});

///////////////////////////////////////
///////////////////////////////////////

btnTransferMoney.addEventListener("click", function (e) {
    e.preventDefault();

    const recieverAccount = accounts.find(
        // find() returns the whole object
        (acc) => acc.username === inputTransferTo.value
    );

    const transferAmount = Number(inputTransferAmount.value);

    if (
        transferAmount > 0 &&
        currentAccount.balance > transferAmount &&
        recieverAccount?.username !== currentAccount.username
    ) {
        // Add transfer movement
        currentAccount.movements.push(-transferAmount);
        recieverAccount.movements.push(transferAmount);

        // Add transfer date
        currentAccount.movementsDates.push(new Date().toISOString());
        recieverAccount.movementsDates.push(new Date().toISOString());

        // Update & Clear fields
        updateUseInterfaceData(currentAccount);
        inputTransferTo.value = inputTransferAmount.value = "";
        inputTransferAmount.blur();
        inputTransferTo.blur();

        // Reset timer
        clearInterval(timer);
        timer = startLogoutTimer();
    } else {
        console.log("❌ Insufficient funds, or cannot add to current account");
    }
});

btnLoanMoney.addEventListener("click", function (e) {
    e.preventDefault();

    // Old - const amount = Number(inputLoanAmount.value));
    // New - dont need Number, because Math does the coercion itself
    const amount = Math.floor(inputLoanAmount.value);

    if (
        amount > 0 &&
        // amount = 5.000, should be >= 50.000
        currentAccount.movements.some((mov) => mov >= amount * 0.1)
    ) {
        console.log("Your loan is being processed...");
        inputLoanAmount.value = "";
        inputLoanAmount.blur();
        setTimeout(function () {
            currentAccount.movements.push(amount);
            currentAccount.movementsDates.push(new Date().toISOString());

            // Update & Clear fields
            updateUseInterfaceData(currentAccount);

            // Reset timer
            clearInterval(timer);
            timer = startLogoutTimer();
        }, 5000);
    } else {
        console.log("❌ Insufficient loan requested!");
    }
});

btnDeleteAccount.addEventListener("click", function (e) {
    e.preventDefault();
    const closeUser = inputCloseUsername.value;
    const closePin = Number(inputClosePin.value);

    // It wont work if we dont have convert it to Number, because it
    // becomes a string when we type it in the input field and submit it.
    // const closePin = inputClosePin.value;
    // console.log(closePin); // 5555

    accounts.forEach(function (element, index) {
        if (
            closeUser === accounts[index].username &&
            closePin === accounts[index].pin
        ) {
            const userIndex = accounts.findIndex(
                (acc) => acc.username === accounts[index].username
            );
            accounts.splice(userIndex, 1);
            loginDecreaseOpacity();
        }
    });

    // could have used this approach
    // for (let i = 0; i < accounts.length; i++) {}
});

///////////////////////////////////////
///////////////////////////////////////

let sorted = false;
btnSort.addEventListener("click", function (e) {
    e.preventDefault();

    displayMovements(currentAccount, !sorted);
    sorted = !sorted;
});

///////////////////////////////////////
///////////////////////////////////////

const sortMovements = function (movs, dates) {
    const arrCombined = [];
    const sortedMovs = [];
    const sortedDates = [];

    movs.forEach((el, i) => arrCombined.push([movs[i], dates[i]]));
    arrCombined.sort((a, b) => a[0] - b[0]);
    arrCombined.forEach((el) => {
        sortedMovs.push(el[0]);
        sortedDates.push(el[1]);
    });

    return [sortedMovs, sortedDates];
};
