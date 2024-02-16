const { errorCounter, warningCounter } = require('../modules/prometheus/prometheus_exporter');

const createError = (message) => {
    errorCounter.inc();
    console.log(message);
}

const createWarning = (message) => {
    warningCounter.inc();
    console.log(message);
}

const resetErrors = (user) => {
    errorCounter.reset();
    console.log('Errors got resetted by ' + user);
}

const resetWarnings = (user) => {
    warningCounter.reset();
    console.log('Warnings got resetted by ' + user);
}

module.exports = {
    createError,
    createWarning,
    resetErrors,
    resetWarnings
};