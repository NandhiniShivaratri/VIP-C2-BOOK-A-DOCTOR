const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const Review = require('../models/Review');
const Payment = require('../models/Payment');

const seedDatabase = async () => {
  try {
    // 1. Clear existing database collections
    await User.deleteMany({});
    await Doctor.deleteMany({});
    await Patient.deleteMany({});
    await Appointment.deleteMany({});
    await Review.deleteMany({});
    await Payment.deleteMany({});

    console.log('Database cleared. Starting seeding process...');

    // Hash passwords
    const adminPasswordHashed = await bcrypt.hash('adminpassword', 10);
    const doctorPasswordHashed = await bcrypt.hash('doctorpassword', 10);
    const patientPasswordHashed = await bcrypt.hash('patientpassword', 10);

    // 2. Seed Admin
    await User.create({
      name: 'MediConnect Admin',
      email: 'admin@medconnect.com',
      password: 'adminpassword', // plain password because UserSchema pre-save hook will hash it if not hashed, wait.
      // Wait, let's verify if Mongoose pre-save hook runs. Yes! User.create() calls pre-save, so it will hash 'adminpassword' automatically.
      // So we can pass plain text and it will hash it.
      phone: '+1 555-0100',
      gender: 'Other',
      role: 'Admin',
      isVerified: true,
    });

    console.log('Admin account seeded.');

    // 3. Seed 10 Patients
    const patientUsers = [];
    const patientNames = [
      'John Doe', 'Emily Watson', 'Michael Johnson', 'David Miller', 'Sophia Martinez',
      'James Wilson', 'Emma Taylor', 'Daniel Anderson', 'Olivia Thomas', 'William Jackson'
    ];
    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

    for (let i = 0; i < patientNames.length; i++) {
      const user = await User.create({
        name: patientNames[i],
        email: `patient${i + 1}@gmail.com`,
        password: 'patientpassword',
        phone: `+1 555-020${i}`,
        gender: i % 2 === 0 ? 'Male' : 'Female',
        role: 'Patient',
        isVerified: true,
      });

      const patient = await Patient.create({
        userId: user._id,
        age: 20 + Math.floor(Math.random() * 40),
        bloodGroup: bloodGroups[Math.floor(Math.random() * bloodGroups.length)],
        emergencyContact: `Family: +1 555-999${i}`,
        address: `${100 + i * 12} Health Blvd, Suite ${i + 1}`,
      });

      patientUsers.push({ user, patient });
    }

    console.log('10 Patients seeded.');

    // 4. Seed 52 Doctors
    const specialties = ['Cardiologist', 'Neurologist', 'Dermatologist', 'Orthopedic', 'Pediatrician', 'Dentist', 'General Medicine'];
    const doctorFirstNames = [
      'Sarah', 'James', 'Robert', 'Patricia', 'Michael', 'Linda', 'Elizabeth', 'William', 'David', 'Barbara',
      'Richard', 'Susan', 'Jessica', 'Thomas', 'Karen', 'Nancy', 'Lisa', 'Betty', 'Dorothy', 'Sandra'
    ];
    const doctorLastNames = [
      'Jenkins', 'Chen', 'Smith', 'Jones', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez',
      'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez'
    ];

    const hospitalNames = ['City General Hospital', 'MediConnect Wellness Center', 'St. Mary Healthcare', 'Mercy Medical Clinic'];
    const languages = [
      ['English'], ['English', 'Spanish'], ['English', 'French'], ['English', 'Mandarin'], 
      ['English', 'Spanish', 'Hindi'], ['English', 'German']
    ];

    const bios = [
      'Dedicated medical professional specializing in patient-centric care and evidence-based treatments.',
      'Highly experienced specialist with a passion for diagnosing complex conditions and restoring health.',
      'Compassionate practitioner focused on holistic wellness, preventative care, and patient education.',
      'Active researcher and practitioner utilizing state-of-the-art diagnostics to optimize clinical outcomes.'
    ];

    const doctorRecords = [];

    // Helper to generate availability slots
    const getAvailability = () => {
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
      const slots = ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'];
      return days.map(day => ({
        day,
        slots: slots.filter(() => Math.random() > 0.3) // randomly pick some slots
      }));
    };

    for (let i = 0; i < 52; i++) {
      const spec = specialties[i % specialties.length];
      const firstName = doctorFirstNames[(i * 3) % doctorFirstNames.length];
      const lastName = doctorLastNames[(i * 7) % doctorLastNames.length];
      const name = `${firstName} ${lastName}`;
      const email = `dr.${firstName.toLowerCase()}.${lastName.toLowerCase()}.${i + 1}@medconnect.com`;

      const user = await User.create({
        name: `Dr. ${name}`,
        email,
        password: 'doctorpassword',
        phone: `+1 555-03${10 + i}`,
        gender: i % 2 === 0 ? 'Male' : 'Female',
        role: 'Doctor',
        isVerified: true,
      });

      // 45 approved, 7 unapproved
      const approved = i < 45;

      const doctor = await Doctor.create({
        userId: user._id,
        specialization: spec,
        qualification: spec === 'Dentist' ? 'BDS, DDS' : 'MD, MBBS',
        experience: 5 + Math.floor(Math.random() * 20),
        consultationFee: 80 + Math.floor(Math.random() * 120),
        hospitalName: hospitalNames[i % hospitalNames.length],
        clinicAddress: `${400 + i * 8} Medical Way, Suite ${100 + i}`,
        availability: getAvailability(),
        about: bios[i % bios.length],
        languages: languages[i % languages.length],
        approved,
      });

      if (approved) {
        doctorRecords.push({ user, doctor });
      }
    }

    console.log('52 Doctors seeded (45 approved, 7 pending verification).');

    // 5. Seed 80 Reviews for approved doctors
    const reviewTexts = [
      'Excellent consultation. Very attentive and professional explanation.',
      'Highly recommend! Very understanding, patient, and knowledgeable.',
      'Excellent experience. Dr. was very detailed and friendly.',
      'The clinic was neat and clean, and the doctor was extremely reassuring.',
      'Good treatment, though there was a 15 minute wait before the appointment.',
      'Very professional behavior and accurate diagnostics. Satisfied.',
      'Amazing doctor who took the time to answer all my questions thoroughly.',
      'Highly professional, expert guidance. Felt in very safe hands.'
    ];

    for (let i = 0; i < 80; i++) {
      // Pick random approved doctor
      const docRec = doctorRecords[Math.floor(Math.random() * doctorRecords.length)];
      // Pick random patient
      const patRec = patientUsers[Math.floor(Math.random() * patientUsers.length)];

      const rating = 4 + (i % 2 === 0 ? 1 : 0) - (i % 5 === 0 ? 1 : 0); // yields 3, 4, or 5 stars

      await Review.create({
        patientId: patRec.user._id,
        doctorId: docRec.doctor._id,
        rating,
        reviewText: reviewTexts[i % reviewTexts.length],
        isVerifiedPatient: true,
        helpfulVotes: Math.floor(Math.random() * 15),
      });
    }

    // Trigger average rating recalculation for all doctors
    for (const docRec of doctorRecords) {
      await Review.getAverageRating(docRec.doctor._id);
    }

    console.log('80 Reviews seeded and doctor ratings recalculated.');

    // 6. Seed 120 Appointments spread over past and future
    // We will save past appointments (Consultation Completed) and future (Confirmed, Requested, Cancelled)
    const appointmentReasons = ['Regular health checkup', 'Follow-up consultation', 'Chronic symptom discussion', 'Second medical opinion', 'Diagnostic review'];
    const paymentMethods = ['Credit Card', 'UPI', 'Stripe Simulation', 'Wallet', 'Cash'];

    const getPastDateStr = (daysAgo) => {
      const d = new Date();
      d.setDate(d.getDate() - daysAgo);
      return d.toISOString().split('T')[0]; // YYYY-MM-DD
    };

    const getFutureDateStr = (daysAhead) => {
      const d = new Date();
      d.setDate(d.getDate() + daysAhead);
      return d.toISOString().split('T')[0]; // YYYY-MM-DD
    };

    // Past appointments (Completed)
    for (let i = 0; i < 90; i++) {
      const docRec = doctorRecords[Math.floor(Math.random() * doctorRecords.length)];
      const patRec = patientUsers[Math.floor(Math.random() * patientUsers.length)];
      const date = getPastDateStr(2 + Math.floor(Math.random() * 150)); // up to 5 months ago

      const app = await Appointment.create({
        patientId: patRec.user._id,
        doctorId: docRec.doctor._id,
        doctorName: docRec.user.name,
        doctorSpecialization: docRec.doctor.specialization,
        consultationFee: docRec.doctor.consultationFee,
        appointmentDate: date,
        appointmentTime: '10:00 AM',
        reason: appointmentReasons[i % appointmentReasons.length],
        status: 'Consultation Completed',
      });

      // Create Payment for this past completed appointment
      await Payment.create({
        appointmentId: app._id,
        patientId: patRec.user._id,
        amount: docRec.doctor.consultationFee,
        paymentMethod: paymentMethods[i % paymentMethods.length],
        status: 'Success',
        transactionId: `tx_${Math.random().toString(36).substring(2, 11).toUpperCase()}`,
        createdAt: new Date(date),
      });
    }

    // Future appointments (Confirmed, Requested, Cancelled)
    for (let i = 0; i < 30; i++) {
      const docRec = doctorRecords[Math.floor(Math.random() * doctorRecords.length)];
      const patRec = patientUsers[Math.floor(Math.random() * patientUsers.length)];
      const date = getFutureDateStr(1 + Math.floor(Math.random() * 20)); // up to 20 days in future

      const statuses = ['Confirmed', 'Requested', 'Cancelled'];
      const status = statuses[i % statuses.length];

      const app = await Appointment.create({
        patientId: patRec.user._id,
        doctorId: docRec.doctor._id,
        doctorName: docRec.user.name,
        doctorSpecialization: docRec.doctor.specialization,
        consultationFee: docRec.doctor.consultationFee,
        appointmentDate: date,
        appointmentTime: '02:00 PM',
        reason: appointmentReasons[i % appointmentReasons.length],
        status,
      });

      // Create payment for future Confirmed/Cancelled appointments
      if (status !== 'Requested') {
        await Payment.create({
          appointmentId: app._id,
          patientId: patRec.user._id,
          amount: docRec.doctor.consultationFee,
          paymentMethod: paymentMethods[i % paymentMethods.length],
          status: status === 'Cancelled' ? 'Failed' : 'Success',
          transactionId: `tx_${Math.random().toString(36).substring(2, 11).toUpperCase()}`,
          createdAt: new Date(),
        });
      }
    }

    console.log('120 Appointments and associated Payments seeded.');
    console.log('DATABASE SEEDING COMPLETED SUCCESSFULLY!');
  } catch (error) {
    console.error('Seeding process failed:', error);
  }
};

module.exports = seedDatabase;
