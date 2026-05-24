# Security Specification: KoraFlix Firestore Zero-Trust Model

This specification outlines the data invariants, threat model, and attack vectors evaluated against the Firestore Security Rules of KoraFlix to ensure a fortress-like security architecture.

## 1. Data Invariants

1. **User Ownership**: A user profile document inside `/users/{userId}` can only be accessed or modified by its respective owner (where `{userId} == request.auth.uid`), unless the requesting client represents verified administrator credentials.
2. **Sign-In Verification**: Any standard write operations require a verified email sign-in (`request.auth.token.email_verified == true`).
3. **Immutability**: Crucial structural attributes such as the profile `uid`, and the user's `email` are strictly immutable after initial creation.
4. **Role Integrity (Self-Assignment Guard)**: Users are strictly prohibited from self-promoting to `admin` role. Standard creations must default to `user` role, and subsequent updates to user roles are completely blocked for non-administrators.
5. **Data Structure Limits**: Sizes of `watchlist` and `history` lists must be bounded, and names must be limited to prevent denial-of-wallet structural bloating.

---

## 2. The "Dirty Dozen" Threat Payloads

The rules are designed to strictly reject and fail transactions containing any of the following 12 malicious payloads:

| ID | Attack Vector | malicious Payload Structure / Operation Details | Expected Output |
| :--- | :--- | :--- | :--- |
| **P1** | Unauthenticated Read | Anonymous request to `get` `/users/usr_12345` | `PERMISSION_DENIED` |
| **P2** | Identity Spoofing Read | Authenticated client (`uid: user_999`) attempting to read `/users/user_abc` | `PERMISSION_DENIED` |
| **P3** | Unauthenticated Write | Anonymous request to `create` `/users/usr_12345` with arbitrary data | `PERMISSION_DENIED` |
| **P4** | Identity Spoofing Create | Client (`uid: user_999`) trying to create a profile under `/users/user_abc` | `PERMISSION_DENIED` |
| **P5** | Self-Role Escalation on Create | Registering user profile holding `"role": "admin"` to gain instant panel rights | `PERMISSION_DENIED` |
| **P6** | Self-Role Escalation on Update | Triggering profile patch with `{"role": "admin"}` from a compromised client | `PERMISSION_DENIED` |
| **P7** | Identity Injection Attack | Writing profile where the body payload `uid` is set to user IDs other than `request.auth.uid` | `PERMISSION_DENIED` |
| **P8** | Email Poisoning / Spoof | Attempting to sign up with unverified or mismatched mock emails in user body | `PERMISSION_DENIED` |
| **P9** | ID Poisoning Attack | Creating user profile with a 10KB string of non-alphanumeric junk characters for document ID | `PERMISSION_DENIED` |
| **P10** | Shadow Field Injection | Appending shadow settings such as `{"bypassed": true, "expiryDate": "2035"}` | `PERMISSION_DENIED` |
| **P11** | Temporal Corruption Attack | Submitting arbitrary local client-timestamps instead of enforcing `request.time` | `PERMISSION_DENIED` |
| **P12** | Database Denial of Wallet | Triggering huge multi-document queries or unbounded list allocations on profile document | `PERMISSION_DENIED` |

---

## 3. The Security Test Suite Runner Plan

The simulated test runner checks conditions to guarantee:
- `get` & `list` are guarded by `userId == auth.uid`
- `create` fields are deeply checked for type matching, sizes, and strict keys.
- `update` controls only allow specific fields modification (`displayName`, `photoURL`, `watchlist`, `history`) if the user is a standard member.
