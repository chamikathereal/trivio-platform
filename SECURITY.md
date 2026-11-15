# Security Policy

Trivio (`trivio.ink`) takes software security and financial data privacy with utmost seriousness.

---

## 1. Supported Versions

Security updates and patches are applied to the active development line:

| Version | Supported | Notes |
| :--- | :--- | :--- |
| `0.1.x` (Stage 1) | :white_check_mark: | Active foundation milestone |
| `< 0.1.0` | :x: | Legacy / prototype code |

---

## 2. Financial Data Boundaries & PCI Considerations

### No Cardholder Data in Core SDKs
The generic Trivio SDKs (`@trivio.ink/core`, `@trivio.ink/node`, `@trivio.ink/react`) are designed strictly for mathematical fee estimation, settlement scheduling, and reconciliation logic.

- **Never** process, store, log, or transmit raw Primary Account Numbers (PAN), CVVs, Cardholder PINs, or banking authentication secrets through Trivio libraries.
- All monetary arithmetic must operate on tokenized transaction IDs, minor-unit amounts, and sanitized acquirer reference codes.

### No Secrets or Credentials Committed
- Never commit private keys, `.env` files, production database connection strings, or banking API keys to this repository.
- Trivio generic packages remain functional completely offline without API credentials.

---

## 3. Reporting a Vulnerability

If you discover a security vulnerability or potential data exposure within Trivio, please report it privately:

1. **Email:** Send details to `security@trivio.ink` (or open a confidential GitHub Security Advisory via the repository security tab).
2. **Details to Provide:**
   - Detailed description of the vulnerability.
   - Proof-of-concept steps or reproduction code.
   - Potential impact assessment.
3. **Response Timeline:**
   - Initial acknowledgement within **48 hours**.
   - Triage, status update, and remediation plan within **5 business days**.

Please do not disclose security issues publicly through issues or social channels until our team has investigated and released a patch.
