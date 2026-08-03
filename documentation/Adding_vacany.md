# Managing Vacancies

The Recruitment System is fully dynamic. All vacancies displayed on the website are loaded directly from Firebase Firestore. There is no need to modify the website code when adding or updating vacancies.

## Adding a New Vacancy

1. Open the Firebase Console.
2. Navigate to **Firestore Database**.
3. Open the **vacancies** collection.
4. Click **Add document**.
5. Leave **Document ID** as **Auto-ID**.
6. Add the following fields:

| Field | Type | Example |
|-------|------|---------|
| title | String | Receptionist |
| location | String | Johannesburg |
| type | String | Permanent |
| description | String | We are looking for a professional receptionist... |
| active | Boolean | true |
| createdAt | Timestamp | Current date and time |
| closingDate | Timestamp | Future closing date |

7. Click **Save**.

The vacancy will automatically appear on the Recruitment page without restarting or redeploying the website.

---

## Editing a Vacancy

1. Open the **vacancies** collection.
2. Select the vacancy document.
3. Modify any of the following fields:
   - Title
   - Location
   - Type
   - Description
   - Closing Date
4. Click **Update**.

The website will automatically refresh with the updated information.

---

## Closing a Vacancy

To remove a vacancy from the public website without deleting it:

Change:

active = true

to

active = false

The vacancy will immediately disappear from the website while remaining stored in Firestore.

---

## Reopening a Vacancy

To make a vacancy visible again:

Change:

active = false

to

active = true

The vacancy will automatically reappear on the Recruitment page.

---

## Deleting a Vacancy

If a vacancy is no longer required:

1. Open the vacancy document.
2. Click the three-dot menu.
3. Select **Delete Document**.
4. Confirm deletion.

The vacancy will be permanently removed from Firestore and will no longer appear on the website.

---

## How the Website Works

When a visitor opens the Recruitment page:

1. The application connects to Firebase Firestore.
2. It retrieves all vacancies where:

active == true

3. The vacancies are sorted by:

createdAt (Newest First)

4. The vacancies are displayed automatically.

No manual website updates or deployments are required.

---

## Current Vacancy Fields

Every vacancy should contain the following fields:

title

location

type

description

active

createdAt

closingDate

These field names are case-sensitive and must match exactly.

---

## Example Vacancy

Title:
Receptionist

Location:
Johannesburg

Type:
Permanent

Description:
We are looking for a professional receptionist with excellent communication and administration skills.

Status:
Open

Closing Date:
20 November 2026

This vacancy will automatically appear on the Recruitment page because:

- active is set to true
- createdAt exists
- The Firestore index has been created

---

## Important Notes

- Never delete the `createdAt` field.
- Always use **Timestamp** for `createdAt` and `closingDate`.
- Always use **Boolean** for `active`.
- Use **Auto-ID** when creating new vacancy documents.
- Changes made in Firestore are reflected on the website in real time.


## Let’s create a proper RMC admin account first.

1. Enable Email/Password sign-in

From the Firebase Authentication screen:

Click Sign-in method.
Select Email/Password.
Turn on Email/Password.
Leave Email link disabled.
Click Save. 

then on firestore/rules 

update the :

##  ADMIN CHECK
    
 function isAdmin() {
      return isSignedIn()
        && request.auth.uid == "2JIt6KezoLTClZ1okWreIAOlwGJ3";
    }


##  Dashboard
  http://localhost:5173/admin/login
  http://localhost:5173/admin/dashboard

