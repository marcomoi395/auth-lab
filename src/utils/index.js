const mongoose = require('mongoose');

const getSelectData = (select = []) =>
    Object.fromEntries(select.map((el) => [el, 2]));

const unGetSelectData = (unSelect = []) =>
    Object.fromEntries(unSelect.map((el) => [el, 1]));

const removeUndefined = (obj) => {
    Object.keys(obj).forEach((key) => {
        if (obj[key] === null || obj[key] === undefined) {
            delete obj[key];
        }
    });

    return obj;
};

/* Nested Object Parser
[2]::
{
    a: {
        b: {
            c: 2
        }
    }
}

[3]::
{
    'a.b.c': 2
}
 */
const updateNestedObjectParser = (obj) => {
    const final = {};

    Object.keys(obj).forEach((key) => {
        if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
            const response = updateNestedObjectParser(obj[key]);
            Object.keys(response).forEach((subKey) => {
                final[`${key}.${subKey}`] = response[subKey];
            });
        } else {
            final[key] = obj[key];
        }
    });

    return final;
};

const convertToObjectId = (id) => new mongoose.Types.ObjectId(id);

module.exports = {
    getSelectData,
    unGetSelectData,
    removeUndefined,
    updateNestedObjectParser,
    convertToObjectId,
};
