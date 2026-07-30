# RMC Group Recruitment System

## Overview

The RMC Group Recruitment System is a production-ready recruitment solution built into the RMC Group website. It enables job seekers to view available vacancies, submit applications online, upload supporting documents, and allows RMC to manage vacancies without changing the website code.

---

# Objectives

The recruitment module allows RMC Group to:

* Display available job vacancies.
* Receive online job applications.
* Allow applicants to upload their CVs and qualifications.
* Store applicant information securely.
* Update vacancies in real time.
* Manage recruitment digitally.

---

# Technology Stack

## Frontend

* Vue 3
* Vue Router
* JavaScript
* CSS
* Vite

## Backend Services

* Firebase Authentication (Anonymous Authentication)
* Firebase Firestore
* Firebase Storage

---

# Project Structure

```text
src/
│
├── components/
├── views/
│   ├── Recruitment.vue
│   ├── RecruitmentApply.vue
│
├── firebase.js
│
├── assets/
│
└── router/
```

---

# Firebase Services Used

## Firestore Database

Collections

### vacancies

Stores all available job vacancies.

Example document

```text
title
location
type
description
active
createdAt
closingDate
```

Example

```text
title: Human Resources Officer
location: Johannesburg
type: Permanent
description: Responsible for HR administration.
active: true
```

---

### applications

Stores all applicant information.

Example document

```text
fullName
email
phone
location
yearsExperience
message
vacancyId
vacancyTitle
cv
qualifications
status
submittedAt
```

Status values

```text
new
reviewing
shortlisted
interview
hired
unsuccessful
```

---

# Firebase Storage

Folder structure

```text
recruitment-applications/

    user-id/

        application-id/

            cv/

                cv.pdf

            qualifications/

                qualification1.pdf

                qualification2.pdf
```

---

# Applicant Journey

1. Applicant opens Recruitment page.

2. Available vacancies load automatically.

3. Applicant selects a vacancy.

4. Applicant completes the application form.

5. Applicant uploads:

* CV
* Qualifications

6. Applicant submits the application.

7. Files are uploaded to Firebase Storage.

8. Applicant information is saved in Firestore.

9. Applicant receives a success confirmation.

10. RMC reviews the application.

---

# Available Vacancies

Vacancies are loaded directly from Firestore using a real-time listener.

Whenever a vacancy is:

* Added
* Edited
* Closed
* Deleted

the website updates automatically without requiring any code changes or redeployment.

---

# Upload Validation

CV

Accepted formats

* PDF
* DOC
* DOCX

Maximum size

5 MB

Qualifications

Accepted formats

* PDF
* JPG
* PNG

Maximum size

5 MB each

Maximum files

5

---

# Applicant Information Collected

* Full Name
* Email Address
* Phone Number
* ID / Passport Number
* Current Location
* Years of Experience
* Vacancy Applied For
* Cover Message
* CV
* Qualifications

---

# Security

The system uses Firebase Security Rules.

Applicants

* Can submit applications.
* Can upload files.
* Cannot view other applications.
* Cannot modify vacancies.

Public Website

* Can only read active vacancies.

Only RMC administrators should manage vacancies and review applications.

---

# Authentication

Anonymous Authentication is enabled.

Applicants do not need to create an account.

Firebase automatically creates a temporary user identity for secure uploads.

---

# Future Admin Dashboard

The next phase of the project will include a Recruitment Administration Dashboard.

Features

## Vacancy Management

* Add Vacancy
* Edit Vacancy
* Delete Vacancy
* Close Vacancy
* Reopen Vacancy

## Application Management

* View Applicants
* Search Applicants
* Download CV
* Download Qualifications
* Change Status
* Add Internal Notes
* Schedule Interviews

---

# Future Email Notifications

Future versions can automatically send emails when:

Applicant submits an application

Example

> Thank you for applying to RMC Group. Your application has been received successfully.

Administrator receives notification

Example

> A new recruitment application has been submitted.

Interview invitation

Shortlisted candidates receive interview details automatically.

---

# Future Features

* Candidate Dashboard
* Applicant Login
* Interview Scheduling
* SMS Notifications
* WhatsApp Notifications
* Bulk CV Download
* Applicant Search
* Skills Filtering
* AI CV Screening
* Recruitment Analytics Dashboard

---

# Production Checklist

Before deployment ensure that:

* Firebase project is created.
* Firestore is enabled.
* Storage is enabled.
* Anonymous Authentication is enabled.
* Firestore Security Rules are configured.
* Storage Security Rules are configured.
* Environment variables are configured.
* HTTPS hosting is enabled.
* File upload validation is tested.
* Vacancy updates are tested.
* Application submission is tested.

---

# System Workflow

```text
Applicant

      │

      ▼

Available Vacancies

      │

      ▼

Select Vacancy

      │

      ▼

Complete Form

      │

      ▼

Upload CV

      │

      ▼

Upload Qualifications

      │

      ▼

Submit Application

      │

      ▼

Firebase Storage
      +
Firebase Firestore

      │

      ▼

RMC Recruitment Team

      │

      ▼

Review Application

      │

      ▼

Shortlist

      │

      ▼

Interview

      │

      ▼

Employment
```

---

# Version

**Project:** RMC Group Recruitment System

**Company:** Reatlegile Management Consulting Group (RMC)

**Developed by:** TriSpark Digital

**Version:** 1.0

**Status:** Production Development
