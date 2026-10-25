# Email Deliverability & DNS Setup Guide

This document outlines the required DNS records, authentication protocols, and reputation best practices for CertiVault email sending.

---

## 1. Sending Domain Configuration

CertiVault uses **`mail.certivault.in`** as the dedicated transactional subdomain.

| Record Type | Host / Name | Value / Destination | TTL | Priority | Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TXT (SPF)** | `mail.certivault.in` | `v=spf1 include:amazonses.com include:resend.com ~all` | 3600 | - | Authorizes email providers to send on behalf of domain |
| **CNAME (DKIM 1)** | `resend._domainkey.mail.certivault.in` | `dkim.resend.com` | 3600 | - | Cryptographic signature of email headers & body |
| **CNAME (DKIM 2)** | `s1._domainkey.mail.certivault.in` | `s1.domainkey.certivault.in` | 3600 | - | Key rotation fallback |
| **TXT (DMARC)** | `_dmarc.certivault.in` | `v=DMARC1; p=reject; rua=mailto:dmarc-reports@certivault.in; pct=100; aspf=r; adkim=r` | 3600 | - | Strict policy rejecting unauthenticated spoofed emails |
| **MX** | `mail.certivault.in` | `feedback-smtp.resend.com` | 3600 | 10 | Route bounces and feedback loop notifications |

---

## 2. From & Reply-To Headers

- **Default From Address:**
  `{Organization Name} via CertiVault <certificates@mail.certivault.in>`
- **Reply-To Address:**
  Organization contact email (configured in Organization Settings at `/app/settings`).
  *Never use `noreply@` as it harms deliverability and discourages valid recipient communication.*

---

## 3. Deliverability Best Practices

1. **Link-First Delivery:**
   Emails contain a primary, high-contrast action button linking to `/c/[publicId]`. Heavy PDF attachments are omitted in initial emails to improve inbox placement and reduce bandwidth/egress costs.
2. **Automated Suppression:**
   Hard bounces and spam complaints trigger immediate insertion into `email_suppressions`. Future dispatches to suppressed addresses are aborted automatically.
3. **Dedicated Transactional Stream:**
   Marketing and promotional emails must never share the `mail.certivault.in` IP or domain stream.
4. **Gradual IP / Domain Warmup:**
   New sending domains should throttle initial sends (e.g. 100/day $\rightarrow$ 500/day $\rightarrow$ 2,500/day $\rightarrow$ unlimited) to establish reputation with Gmail, Yahoo, and Outlook postmasters.
