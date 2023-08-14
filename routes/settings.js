const express = require('express');
const router = express.Router();
const Settings = require('../models/settings.js');

// View all settings
router.get('/admin/settings', async (req, res) => {
    try {
      const settings = await Settings.find();
      res.render('admin/settings', { settings });
    } catch (error) {
      console.error(error);
      res.status(500).send('Greska u citanju podesavanja');
    }
  });
  

// Add new settings
router.post('/admin/settings/add', async (req, res) => {
  try {
    const { reservationExpiry, returnDeadline, conflictDeadline } = req.body;
    await Settings.create({ reservationExpiry, returnDeadline, conflictDeadline });
    res.redirect('/admin/settings');
  } catch (error) {
    console.error(error);
    res.status(500).send('Greska pri dodavanju podesavanja');
  }
});

// Edit settings (show edit form)
// Route to display edit settings form
router.get('/admin/settings/edit/:id', async (req, res) => {
    try {
        const setting = await Settings.findById(req.params.id);
        res.render('admin/editSettings', { setting }); // Pass the setting object
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching settings');
    }
});


// Update settings
router.post('/admin/settings/edit/:id', async (req, res) => {
  try {
    const { reservationExpiry, returnDeadline, conflictDeadline } = req.body;
    await Settings.findByIdAndUpdate(req.params.id, { reservationExpiry, returnDeadline, conflictDeadline });
    res.redirect('/admin/settings');
  } catch (error) {
    console.error(error);
    res.status(500).send('Greska pri izmeni podesavanja');
  }
});

// Delete settings
router.get('/admin/settings/delete/:id', async (req, res) => {
  try {
    await Settings.findByIdAndDelete(req.params.id);
    res.redirect('/admin/settings');
  } catch (error) {
    console.error(error);
    res.status(500).send('Greska pri brisanju podesavanja');
  }
});

module.exports = router;
