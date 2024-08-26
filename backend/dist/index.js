"use strict";
const epxress = require('express');
const app = epxress();
app.get('/', (req, res) => {
    res.status(200).json({ message: 100 });
});
app.listen(2000);
