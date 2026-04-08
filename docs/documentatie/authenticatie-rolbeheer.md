# Authenticatie & Rolbeheer


## Rollen & Toegang

| Rol | Toegang |
|---|---|
| **Admin** | Beheer van studenten en docenten (volledig CRUD) |
| **Teacher** | Studentprofielen bekijken/bewerken, AI-opdrachten genereren, chatten met AI |
| **Student** | Eigen portaal, opdrachten bekijken/inleveren, chatten met Juf Aimee |

---

## Authenticatiestroom

1. Gebruiker vult e-mail en wachtwoord in op `/login`
2. Het systeem zoekt eerst in de **User** tabel (docenten/admins), daarna in de **Student** tabel
3. Wachtwoord wordt geverifieerd met `bcryptjs`
4. Bij succes wordt een HTTP-only session cookie gezet:
   - `session_user_id` — voor docenten en admins (geldig 7 dagen)
   - `session_student_id` — voor studenten (geldig 7 dagen)
5. Doorverwijzing op basis van rol:
   - Admin → `/admin`
   - Teacher → `/dashboard`
   - Student → `/student/{id}`

---

## Rolgebaseerde Navigatie

### Admin
- Dashboard → `/admin`
- Studenten → `/admin/students`
- Docenten → `/admin/teachers`

### Docent
- Dashboard → `/dashboard`
- Studenten → `/students`
- Opdrachten → `/opdrachten`

### Student
- Portaal → `/prototype/leerling-portaal/{id}`
- Opdrachten → `/prototype/leerling-portaal/{id}/opdrachten`

---

## Beschermde Routes

Elke layoutlaag controleert de sessie en stuurt niet-geauthenticeerde gebruikers terug naar `/login`:

- **Admin layout** — valideert `role === "ADMIN"`
- **Dashboard layout** — accepteert elke `User` rol (docent of admin)
- **Student layout** — valideert dat het `Student` record bestaat

---

## Database Modellen

| Model | Beschrijving |
|---|---|
| **User** | Docenten en admins; bevat naam, e-mail, gehashed wachtwoord en rol (`TEACHER` / `ADMIN`) |
| **Student** | Kernrecord van de leerling: persoonlijke info, schoolgroep en Bloom-niveau |
| **StudentProfile** | Uitgebreide academische data: registratienummer, schoolgeschiedenis, huidig leerjaar |
