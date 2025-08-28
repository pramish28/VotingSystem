// // seed-admin-fixed.js
// require('dotenv').config();

// const { MongoClient } = require('mongodb');
// const bcrypt = require('bcryptjs');
// const fs = require('fs');
// const path = require('path');

// const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/voting_system';
// const ADMIN_EMAIL = 'admin@gmail.com';
// const ADMIN_PASSWORD = 'admin123';

// function ensureUploadsPlaceholder() {
//   const uploads = path.join(__dirname, 'Uploads');
//   if (!fs.existsSync(uploads)) fs.mkdirSync(uploads, { recursive: true });
//   const file = path.join(uploads, 'seed-admin.txt');
//   if (!fs.existsSync(file)) fs.writeFileSync(file, 'admin placeholder\n');
//   // Keep Windows-style backslashes to match existing paths
//   return 'Uploads\\seed-admin.txt';
// }

// (async () => {
//   const client = new MongoClient(MONGO_URI);

//   try {
//     console.log(`🔌 Connecting to ${MONGO_URI} ...`);
//     await client.connect();
//     const db = client.db();
//     const users = db.collection('users');

//     const placeholderPath = ensureUploadsPlaceholder();
//     const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);

//     // Guaranteed-unique placeholder values (fixed).
//     // If the admin already exists, we keep these same values to avoid unique conflicts.
//     const fixedSymbolNumber = 'ADMIN-0001';
//     const fixedPhone = '+9779800000001';
//     const fixedVoterId = 'ADMIN-VOTER-0001';

//     // Upsert: create if missing, otherwise update password + role and required fields.
//     const res = await users.updateOne(
//       { email: ADMIN_EMAIL },
//       {
//         $set: {
//           name: 'System Admin',
//           email: ADMIN_EMAIL,
//           password: hash,
//           role: 'admin',

//           // Required fields in your schema
//           degree: 'Admin',
//           faculty: 'Administration',
//           program: 'Administration',
//           major: 'None',
//           yearOrSemester: 'N/A',
//           symbolNumber: fixedSymbolNumber,
//           phoneNumber: fixedPhone,
//           address: 'Head Office',
//           photo: placeholderPath,
//           semesterBill: placeholderPath,
//           identityCard: placeholderPath,
//           voterId: fixedVoterId,

//           isVerified: true,
//           verifiedAt: new Date(),
//           preferences: {
//             emailNotifications: true,
//             smsAlerts: false,
//             resultNotifications: true,
//           },
//           hasVoted: false,
//           updatedAt: new Date(),
//         },
//         $setOnInsert: {
//           createdAt: new Date(),
//         },
//       },
//       { upsert: true }
//     );

//     if (res.upsertedCount > 0) {
//       console.log('✅ Admin created.');
//     } else if (res.matchedCount > 0) {
//       console.log('✅ Existing admin updated (password + fields refreshed).');
//     } else {
//       console.log('ℹ️ No changes made (already identical).');
//     }

//     console.log(`👤 Email: ${ADMIN_EMAIL}`);
//     console.log(`🔑 Password: ${ADMIN_PASSWORD}`);
//   } catch (err) {
//     console.error('❌ Failed:', err);
//     process.exit(1);
//   } finally {
//     await client.close();
//   }
// })();


// seed-temp-users.js
// require('dotenv').config();

// const { MongoClient } = require('mongodb');
// const bcrypt = require('bcryptjs');
// const fs = require('fs');
// const path = require('path');
// const crypto = require('crypto');

// /** ====== YOUR COURSE MAPS ====== */
// const facultyOptions = {
//   Bachelor: {
//     Science: {
//       'B.Sc. CSIT': ['None'],
//       'B.Sc. Environment Science': ['None'],
//       BIT: ['None'],
//       'B.Sc. General': ['Physics', 'Chemistry', 'Botany'],
//     },
//     Management: {
//       BBS: ['Finance', 'Marketing', 'Accounting'],
//       BBA: ['None'],
//       BBM: ['None'],
//       BCA: ['None'],
//     },
//     Humanities: {
//       BASW: ['None'],
//       BA: ['English', 'Nepali', 'Economics', 'Sociology', 'Nepal Bhasa'],
//     }
//   },
//   Master: {
//     Science: {
//       'M.Sc. Physics': ['None'],
//       'M.Sc. Environment Science': ['None'],
//       MIT: ['None'],
//     },
//     Management: {
//       MBS: ['Finance', 'Marketing', 'Accounting'],
//       MBA: ['None'],
//       MCA: ['None'],
//     },
//     Humanities: {
//       MA: ['English', 'Nepali', 'Economics', 'Sociology', 'Rural Development'],
//     }
//   }
// };

// const yearSemesterOptions = {
//   'B.Sc. CSIT': 'Semester',
//   'B.Sc. Environment Science': 'Year',
//   'B.Sc. General': 'Year',
//   BIT: 'Semester',
//   BBS: 'Year',
//   BBA: 'Semester',
//   BBM: 'Semester',
//   BCA: 'Semester',
//   BASW: 'Year',
//   BA: 'Year',
//   'M.Sc. Physics': 'Semester',
//   'M.Sc. Environment Science': 'Semester',
//   MIT: 'Semester',
//   MBS: 'Year',
//   MBA: 'Semester',
//   MCA: 'Semester',
//   MA: 'Year',
// };

// function getLevelOptions(program) {
//   const system = yearSemesterOptions[program];
//   if (!system) return [];

//   const isBachelor = Object.values(facultyOptions.Bachelor).some(fac =>
//     Object.keys(fac).includes(program)
//   );

//   if (system === 'Semester') {
//     return isBachelor
//       ? [
//           '1st Semester', '2nd Semester', '3rd Semester', '4th Semester',
//           '5th Semester', '6th Semester', '7th Semester', '8th Semester'
//         ]
//       : [
//           '1st Semester', '2nd Semester', '3rd Semester', '4th Semester'
//         ];
//   } else if (system === 'Year') {
//     return isBachelor
//       ? ['1st Year', '2nd Year', '3rd Year', '4th Year']
//       : ['1st Year', '2nd Year'];
//   }
//   return [];
// }

// /** ===== helpers ===== */
// const randItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

// function pickDegreeFacultyProgramMajor() {
//   const degree = randItem(Object.keys(facultyOptions));
//   const facMap = facultyOptions[degree];
//   const faculty = randItem(Object.keys(facMap));
//   const progMap = facMap[faculty];
//   const program = randItem(Object.keys(progMap));
//   const majors = progMap[program];
//   const major = randItem(majors);
//   return { degree, faculty, program, major };
// }

// function randomName() {
//   const first = ['Aarav','Aashish','Bikash','Kiran','Nabin','Prakash','Sagar','Sujan','Suman','Utsav','Sita','Gita','Rita','Anita','Nisha','Mina','Sangita','Sunita','Sanjana','Puja','Ramesh','Dinesh','Manish','Anil','Kamal','Pramod','Sarita','Sabina','Asmita','Pawan'];
//   const last  = ['Sharma','Gurung','Tamang','Rai','Thapa','KC','Karki','Shrestha','Maharjan','Basnet','Poudel','Bhattarai','Bhandari','Adhikari','Pandey','Lama','Magar','Sapkota','Baral','Khadka'];
//   return { first: randItem(first), last: randItem(last) };
// }

// function sanitizeNamePart(s) {
//   return String(s || '')
//     .toLowerCase()
//     .replace(/[^a-z]/g, ''); // keep letters only
// }

// // Random digits with random length (min..max)
// function randDigits(minLen = 4, maxLen = 7) {
//   const len = Math.floor(Math.random() * (maxLen - minLen + 1)) + minLen;
//   // Use crypto for better randomness; then filter to digits
//   let s = '';
//   while (s.length < len) {
//     s += crypto.randomBytes(4).toString('hex'); // hex
//   }
//   // Convert hex string to digits (strip non-digits) and pad by mixing with Math.random if needed
//   s = s.replace(/\D/g, '');
//   // If somehow not enough digits after stripping, append pure random digits
//   while (s.length < len) s += Math.floor(Math.random() * 10).toString();
//   return s.slice(0, len);
// }

// // Keep run-uniqueness with a Set
// const emailSet = new Set();
// function makeUniqueEmail(first, last) {
//   const f = sanitizeNamePart(first);
//   const l = sanitizeNamePart(last);
//   let email;
//   let tries = 0;
//   do {
//     // pure random numeric tail with random length between 4 and 7
//     const tail = randDigits(4, 7);
//     email = `${f}${l}${tail}@gmail.com`;
//     tries++;
//   } while (emailSet.has(email) && tries < 10000);
//   emailSet.add(email);
//   return email;
// }

// function ensureUploadsPlaceholder() {
//   const uploads = path.join(__dirname, 'Uploads');
//   if (!fs.existsSync(uploads)) fs.mkdirSync(uploads, { recursive: true });
//   const file = path.join(uploads, 'seed-placeholder.txt');
//   if (!fs.existsSync(file)) fs.writeFileSync(file, 'seed placeholder\n');
//   return `Uploads\\seed-placeholder.txt`; // Keep Windows-style path to match your app
// }

// async function ensureIndexes(users) {
//   const dropIfExists = async (name) => { try { await users.dropIndex(name); } catch {} };

//   await dropIfExists('symbolNumber_1');
//   await dropIfExists('phoneNumber_1');
//   await dropIfExists('voterId_1');
//   await dropIfExists('email_1');

//   await users.createIndex(
//     { email: 1 },
//     { unique: true, partialFilterExpression: { email: { $type: 'string' } } }
//   );
//   await users.createIndex(
//     { symbolNumber: 1 },
//     { unique: true, partialFilterExpression: { symbolNumber: { $type: 'string' } } }
//   );
//   await users.createIndex(
//     { phoneNumber: 1 },
//     { unique: true, partialFilterExpression: { phoneNumber: { $type: 'string' } } }
//   );
//   await users.createIndex(
//     { voterId: 1 },
//     { unique: true, partialFilterExpression: { voterId: { $type: 'string' } } }
//   );
// }

// function randomPhone(batch, i, phoneSet) {
//   // Random Nepal-like mobile + uniqueness guard
//   let phone, tries = 0;
//   do {
//     const tail = String(Math.floor(10_000_000 + Math.random() * 89_999_999)).slice(0, 8);
//     phone = `+97798${tail}`;
//     tries++;
//   } while (phoneSet.has(phone) && tries < 10000);
//   phoneSet.add(phone);
//   return phone;
// }

// function randomSymbolNumber(batch, i) {
//   return `SEED-${batch}-${i}`;
// }

// function randomVoterId(batch, i) {
//   return `VOTE-${batch.toUpperCase()}-${i.toString(36).toUpperCase()}`;
// }

// /** ===== main ===== */
// (async () => {
//   const COUNT = parseInt(process.argv[2] || '1000', 10);
//   const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/voting_system';
//   const client = new MongoClient(uri);

//   try {
//     console.log(`🔌 Connecting to ${uri} ...`);
//     await client.connect();
//     const db = client.db();
//     const users = db.collection('users');

//     // Make sure unique indexes don't choke on legacy nulls
//     await ensureIndexes(users);
//     await users.deleteMany({ symbolNumber: null }); // remove bad rows with null uniques (optional)

//     const placeholder = ensureUploadsPlaceholder();

//     const batch = crypto.randomBytes(3).toString('hex'); // random batch tag
//     const passwordPlain = process.env.SEED_USER_PASSWORD || 'password';
//     const passwordHash = await bcrypt.hash(passwordPlain, 10);

//     const phoneSet = new Set(); // ensure uniqueness in this run

//     const docs = [];
//     for (let i = 1; i <= COUNT; i++) {
//       const { degree, faculty, program, major } = pickDegreeFacultyProgramMajor();
//       const levels = getLevelOptions(program);
//       const yearOrSemester = levels.length ? randItem(levels) : '1st Year';

//       const { first, last } = randomName();
//       const name = `${first} ${last}`;
//       const email = makeUniqueEmail(first, last);

//       docs.push({
//         name,
//         email,
//         password: passwordHash,
//         role: 'student',
//         degree,
//         faculty,
//         program,
//         major,
//         yearOrSemester,
//         symbolNumber: randomSymbolNumber(batch, i),
//         phoneNumber: randomPhone(batch, i, phoneSet),
//         address: `Seed City Ward-${(i % 20) + 1}`,
//         photo: placeholder,
//         semesterBill: placeholder,
//         identityCard: placeholder,
//         voterId: randomVoterId(batch, i),
//         isVerified: true,
//         verifiedAt: new Date(),
//         preferences: {
//           emailNotifications: true,
//           smsAlerts: false,
//           resultNotifications: true,
//         },
//         hasVoted: false,
//         createdAt: new Date(),
//         updatedAt: new Date(),
//       });
//     }

//     console.log(`🧪 Inserting ${COUNT} users...`);
//     const result = await users.insertMany(docs, { ordered: false });
//     console.log(`✅ Inserted ${Object.keys(result.insertedIds).length} users`);
//     console.log(`🔑 Password for all: ${passwordPlain}`);

//     // Quick summaries to help you verify distributions
//     const degreeAgg = await users.aggregate([
//       { $match: { isVerified: true, role: { $ne: 'admin' } } },
//       { $group: { _id: "$degree", n: { $sum: 1 } } },
//       { $sort: { n: -1 } }
//     ]).toArray();

//     const facultyAgg = await users.aggregate([
//       { $match: { isVerified: true, role: { $ne: 'admin' } } },
//       { $group: { _id: "$faculty", n: { $sum: 1 } } },
//       { $sort: { n: -1 } }
//     ]).toArray();

//     const programAgg = await users.aggregate([
//       { $match: { isVerified: true, role: { $ne: 'admin' } } },
//       { $group: { _id: "$program", n: { $sum: 1 } } },
//       { $sort: { n: -1 } },
//       { $limit: 15 }
//     ]).toArray();

//     console.log("\n📊 Degree counts:", degreeAgg);
//     console.log("📊 Faculty counts:", facultyAgg);
//     console.log("📊 Top programs (first 15):", programAgg);

//     console.log("🎉 Done.");
//   } catch (err) {
//     console.error("❌ Seeder failed:", err);
//     process.exit(1);
//   } finally {
//     await client.close();
//   }
// })();
