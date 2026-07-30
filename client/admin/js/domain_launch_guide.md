# 🚀 Domain Buy Karne Se Lekar Website Live Karne Tak
### Wizz Cars Godalming — Complete Step-by-Step Guide

---

> [!IMPORTANT]
> Aapka project pehle hi **GitHub → Vercel** se connected hai. Isliye sirf **Domain buy karna** aur **DNS connect karna** bacha hua hai. Koi code change nahi karna.

---

## 📋 Quick Overview (Poora Plan Ek Nazar Mein)

```
STEP 1 → Domain choose aur buy karein (Namecheap)
STEP 2 → Vercel Dashboard mein domain add karein
STEP 3 → Registrar ke DNS panel mein records update karein
STEP 4 → Vercel par verify karein aur SSL check karein
STEP 5 → Code mein URL update karein aur push karein
STEP 6 → Final checks aur launch!
```

---

## 🛒 STEP 1: Domain Buy Karein

### Recommended Registrar: Namecheap (Sasta + Reliable)

1. **Namecheap.com** par jaayein → [namecheap.com](https://www.namecheap.com)
2. Search box mein apna desired domain likhein:
   ```
   wizzcarsgodalming.co.uk
   ```
   *(Ya jo bhi domain aap lena chahte hain)*

3. Agar **`.co.uk`** available hai to price £5–£10/year ke aas paas hogi.
4. **"Add to Cart"** → **"Checkout"** par click karein.
5. Account banayein (email + password).
6. Payment karo (Credit/Debit Card ya PayPal).

> [!TIP]
> `.co.uk` domain best hai kyunke aapka business UK mein hai.
> Google bhi local `.co.uk` domains ko UK search results mein zyada prefer karta hai (Local SEO).

---

## ⚙️ STEP 2: Vercel Dashboard Mein Domain Add Karein

1. **[vercel.com](https://vercel.com)** par jaayein aur **Login** karein.
2. Apna project **"Wizz Cars Godalming"** par click karein.
3. Top mein **"Settings"** tab par click karein.
4. Left sidebar mein **"Domains"** click karein.

   ![Vercel Domains Section]

5. Input box mein apna domain likhein:
   ```
   wizzcarsgodalming.co.uk
   ```

6. **"Add"** button click karein.

7. Ek popup aayega — ye option select karein:
   ```
   ✅ Redirect wizzcarsgodalming.co.uk → www.wizzcarsgodalming.co.uk (Recommended)
   ```
   Phir **"Add"** par click karein.

8. Ab aapko **do domains** dikh rahe honge:
   - `www.wizzcarsgodalming.co.uk` — **Status: Invalid Configuration** ❌
   - `wizzcarsgodalming.co.uk` — **Status: Invalid Configuration** ❌

   *(Ye normal hai — abhi DNS update nahi hua)*

9. **`www.wizzcarsgodalming.co.uk`** wali entry par click karein.
   Aapko **2 important values** dikhein gi — inhein **copy kar ke kisi jagah save kar lein**:

   | Record Type | Value |
   |---|---|
   | **A Record** | `76.76.21.21` |
   | **CNAME** | `cname.vercel-dns.com` |

---

## 🌐 STEP 3: Namecheap DNS Settings Update Karein

1. **[namecheap.com](https://www.namecheap.com)** par login karein.
2. Top-right par **"Account"** → **"Dashboard"** par click karein.
3. Apna domain **"wizzcarsgodalming.co.uk"** ke saamne **"Manage"** button click karein.
4. **"Advanced DNS"** tab par click karein.

   Yahan aapko pehle se kuch default records honge. **Pehle unhe delete karein:**
   - Koi bhi `A Record` jo pehle se mojood ho → Delete ❌
   - Koi bhi `CNAME` jo `www` naam se ho → Delete ❌

5. Ab **2 nayi entries add karein** — **"Add New Record"** button use karein:

   ### 🔹 Record 1 — A Record (Root Domain ke liye)
   | Field | Value |
   |---|---|
   | **Type** | `A Record` |
   | **Host** | `@` |
   | **Value** | `76.76.21.21` |
   | **TTL** | `Automatic` |

   ### 🔹 Record 2 — CNAME Record (www ke liye)
   | Field | Value |
   |---|---|
   | **Type** | `CNAME Record` |
   | **Host** | `www` |
   | **Value** | `cname.vercel-dns.com` |
   | **TTL** | `Automatic` |

6. **"Save all changes"** ✅ par click karein.

---

## ✅ STEP 4: Vercel Par Verify Karein

1. Wapas **Vercel Dashboard → Settings → Domains** par jaayein.
2. Dono domains ke saamne **"Refresh"** icon par click karein.
3. Wait karein — DNS propagate hone mein **5 minutes se 1 hour** lag sakta hai.
4. Jab sab theek ho jayega to status change hoga:

   ```
   ❌ Invalid Configuration
          ↓
   ✅ Valid Configuration
   ```

5. **SSL Certificate (HTTPS)** bhi automatically generate hoga.
   Aapko koi extra kaam nahi karna — Vercel khud handle karta hai.

> [!NOTE]
> Agar 1 ghante ke baad bhi red status rahe to Namecheap mein se records dobara check karein — aksar typo ki wajah se error aata hai.

---

## 📝 STEP 5: Code Mein URL Update Karein

Sirf **ek jagah** code update karna hai — Open Graph meta tag mein purana URL replace karna hai.

**File:** `client/index.html` — **Line 15**

**Purana:**
```html
<meta property="og:url" content="https://wizzcarsgodalming.co.uk">
```

**Naya (sirf agar domain alag ho):**
```html
<meta property="og:url" content="https://www.wizzcarsgodalming.co.uk">
```

Phir **GitHub par push karein:**
```bash
git add .
git commit -m "Updated domain URL in meta tags"
git push
```

Vercel automatically naya deployment kar dega! 🚀

---

## 🏁 STEP 6: Final Checks — Launch Se Pehle

Browser mein open karke ye sab check karein:

- [ ] `https://www.wizzcarsgodalming.co.uk` opens karta hai ✅
- [ ] Browser mein **padlock (🔒 HTTPS)** icon dikh raha hai ✅
- [ ] `http://wizzcarsgodalming.co.uk` automatically `www` par redirect ho raha hai ✅
- [ ] Booking form submit ho rahi hai ✅
- [ ] Admin panel `https://www.wizzcarsgodalming.co.uk/admin/` par kaam kar raha hai ✅
- [ ] Phone aur WhatsApp buttons kaam kar rahe hain ✅
- [ ] FAQs aur Fleet page dynamically load ho raha hai ✅

---

## 🎉 Ho Gaya — Site Live Hai!

```
GitHub Repository
       ↓  (Auto Deploy on every git push)
   Vercel Hosting  ←──────────────────────────────┐
       ↓  (Free SSL + Global CDN)                  │
www.wizzcarsgodalming.co.uk                        │
       ↓                                           │
 Supabase Database (Bookings, FAQs, Reviews, etc.) │
       ↓                                           │
 Admin Panel: /admin/ ─────────────────────────────┘
```

---

## 💰 Total Cost Summary

| Item | Provider | Cost |
|---|---|---|
| Domain `.co.uk` | Namecheap | ~£5–£10 / year |
| Hosting | Vercel (Free) | £0 / month |
| SSL Certificate | Vercel (Auto) | £0 |
| Database | Supabase (Free Tier) | £0 / month |
| **Total** | | **~£5–£10 / year only** |

> [!TIP]
> Namecheap par **"Domain Privacy Protection"** (WhoisGuard) free milti hai — ise enable zaroor karein taake aapki personal details public WHOIS database mein na dikhein.

---

*Guide prepared for Wizz Cars Godalming — July 2026*
