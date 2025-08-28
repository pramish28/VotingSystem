// import React, { useEffect, useMemo, useState } from 'react';
// import './ElectionForm.css';
// import api, { createElection } from '../api';

// const partiesList = [
//   "अनेरास्ववियू (CPN-UML)", "अनेरास्ववियू (पाँचौं)", "अनेरास्ववियू (एकीकृत समाजवादी)", "क्रान्तिकारी (माओवादी केन्द्र)",
//   "क्रान्तिकारी–बहुमत", "क्रान्तिकारी–वैद्य", "अखिल समाजवादी", "अनेरास्ववियू (छैठौं)", "नेविसंघ (Nepali Congress)",
//   "लोकतान्त्रिक विद्यार्थी संघ", "नागरिक विद्यार्थी समाज", "राष्ट्रिय प्रजातान्त्रिक संगठन", "राष्ट्रिय प्रजातान्त्रिक संगठन, नेपाल",
//   "नेशनल स्टूडेन्ट फोरम", "नेशनल स्टूडेन्ट्स यूनियन", "नया शक्ति युनियन", "विद्यार्थी मोर्चा", "क्रान्तिकारी विद्यार्थी युनियन",
//   "वैज्ञानिक समाजवादी फ्रन्ट", "वैज्ञानिक समाजवादी संगठन", "समाजवादी विद्यार्थी युनियन", "समाजवादी युनियन, नेपाल", "विद्यार्थी जनमत संघ"
// ];

// const posts = [
//   { label: "राष्ट्रपति", key: "president" },
//   { label: "उप-राष्ट्रपति", key: "vicePresident" },
//   { label: "सचिव", key: "secretary" },
//   { label: "कोषाध्यक्ष", key: "treasurer" }
// ];

// export default function ElectionForm() {
//   const [electionTitle, setElectionTitle] = useState("");
//   const [startDate, setStartDate] = useState("");
//   const [endDate, setEndDate] = useState("");

//   // verified students for dropdown
//   const [verifiedUsers, setVerifiedUsers] = useState([]);
//   const [loadingUsers, setLoadingUsers] = useState(true);
//   const [usersError, setUsersError] = useState("");

//   // party sections & independents (same structure you had, but we add selectedUserId fields)
//   const [partySections, setPartySections] = useState([]);
//   const [independents, setIndependents] = useState([]);
//   const [samanupatikParties, setSamanupatikParties] = useState([]);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const chosenParties = partySections.map(p => p.partyName).filter(Boolean);
//   const chosenSamanupatik = samanupatikParties.filter(Boolean);

//   // ---------- load verified students (NO voterId in labels) ----------
//   useEffect(() => {
//     let alive = true;
//     (async () => {
//       try {
//         setLoadingUsers(true);
//         setUsersError("");
//         const res = await api.get('/api/users/verified');
//         const list = Array.isArray(res.data) ? res.data : [];
//         // map & normalize; IMPORTANT: include symbolNumber, exclude voterId in UI
//         const clean = list.map(u => ({
//           _id: String(u._id),
//           name: u.name,
//           faculty: u.faculty || '',
//           program: u.program || '',
//           symbolNumber: u.symbolNumber || '',
//           // keep whatever photo path you store (optional preview only)
//           photo: u.photo || '',
//         }));
//         if (alive) setVerifiedUsers(clean);
//       } catch (e) {
//         if (alive) setUsersError(e.response?.data?.error || e.message || 'Failed to load verified users');
//       } finally {
//         if (alive) setLoadingUsers(false);
//       }
//     })();
//     return () => { alive = false; };
//   }, []);

//   // ---------- helpers ----------
//   function validateFile(file) {
//     const filetypes = /jpeg|jpg|png/;
//     const maxSize = 5 * 1024 * 1024; // 5MB
//     if (!filetypes.test(file.type)) {
//       alert("केवल JPEG, JPG, वा PNG फाइलहरू अनुमति छन्!");
//       return false;
//     }
//     if (file.size > maxSize) {
//       alert("फाइलको साइज ५ MB भन्दा कम हुनुपर्छ!");
//       return false;
//     }
//     return true;
//   }

//   function addPartySection() {
//     setPartySections(prev => [...prev, {
//       partyName: "",
//       candidates: {
//         // add selectedUserId per slot; we still keep name/photo to match your backend payload
//         president:    { name: "", photo: null, preview: null, selectedUserId: "" },
//         vicePresident:{ name: "", photo: null, preview: null, selectedUserId: "" },
//         secretary:    { name: "", photo: null, preview: null, selectedUserId: "" },
//         treasurer:    { name: "", photo: null, preview: null, selectedUserId: "" },
//         members: Array(12).fill(null).map(() => ({ name: "", photo: null, preview: null, selectedUserId: "" }))
//       }
//     }]);
//   }

//   function changePartyName(index, value) {
//     if (chosenParties.includes(value) && value !== partySections[index].partyName) return;
//     setPartySections(prev => {
//       const copy = [...prev];
//       copy[index].partyName = value;
//       return copy;
//     });
//   }

//   // set candidate FILE photo (unchanged from your version)
//   function changeCandidatePhoto(sectionIndex, postKey, file, memberIndex = null) {
//     if (file && !validateFile(file)) return;
//     setPartySections(prev => {
//       const copy = [...prev];
//       const section = copy[sectionIndex];
//       if (postKey === "members" && memberIndex !== null) {
//         const newMembers = [...section.candidates.members];
//         newMembers[memberIndex].photo = file || null;
//         newMembers[memberIndex].preview = file ? URL.createObjectURL(file) : null;
//         section.candidates.members = newMembers;
//       } else {
//         section.candidates[postKey].photo = file || null;
//         section.candidates[postKey].preview = file ? URL.createObjectURL(file) : null;
//       }
//       return copy;
//     });
//   }

//   // select verified student for a position (this sets candidate name automatically)
//   function selectCandidateUser(sectionIndex, postKey, userId, memberIndex = null) {
//     setPartySections(prev => {
//       const copy = [...prev];
//       const section = copy[sectionIndex];

//       const u = verifiedUsers.find(x => x._id === userId) || null;
//       const name = u ? u.name : "";

//       if (postKey === "members" && memberIndex !== null) {
//         const arr = [...section.candidates.members];
//         arr[memberIndex] = {
//           ...arr[memberIndex],
//           selectedUserId: userId || "",
//           name, // keep name in payload for your backend
//         };
//         section.candidates.members = arr;
//       } else {
//         section.candidates[postKey] = {
//           ...section.candidates[postKey],
//           selectedUserId: userId || "",
//           name,
//         };
//       }
//       return copy;
//     });
//   }

//   // Independents (same idea as above)
//   function addIndependent() {
//     setIndependents(prev => [...prev, { post: "", selectedUserId: "", name: "", photo: null, preview: null }]);
//   }

//   function changeIndependentField(index, field, value) {
//     setIndependents(prev => {
//       const copy = [...prev];
//       copy[index][field] = value;
//       return copy;
//     });
//   }

//   function changeIndependentPhoto(index, file) {
//     if (file && !validateFile(file)) return;
//     setIndependents(prev => {
//       const copy = [...prev];
//       copy[index].photo = file || null;
//       copy[index].preview = file ? URL.createObjectURL(file) : null;
//       return copy;
//     });
//   }

//   function selectIndependentUser(index, userId) {
//     setIndependents(prev => {
//       const copy = [...prev];
//       const u = verifiedUsers.find(x => x._id === userId) || null;
//       copy[index].selectedUserId = userId || "";
//       copy[index].name = u ? u.name : "";
//       return copy;
//     });
//   }

//   function addSamanupatikParty() {
//     setSamanupatikParties(prev => [...prev, ""]);
//   }

//   function changeSamanupatikParty(index, value) {
//     if (chosenSamanupatik.includes(value) && value !== samanupatikParties[index]) return;
//     setSamanupatikParties(prev => {
//       const copy = [...prev];
//       copy[index] = value;
//       return copy;
//     });
//   }

//   // ---------- "one person, one position" ----------
//   const chosenUserIds = useMemo(() => {
//     const set = new Set();

//     for (const section of partySections) {
//       const c = section.candidates || {};
//       ['president','vicePresident','secretary','treasurer'].forEach(k => {
//         const sid = c[k]?.selectedUserId;
//         if (sid) set.add(sid);
//       });
//       for (const m of c.members || []) {
//         if (m?.selectedUserId) set.add(m.selectedUserId);
//       }
//     }
//     for (const ind of independents) {
//       if (ind?.selectedUserId) set.add(ind.selectedUserId);
//     }
//     return set;
//   }, [partySections, independents]);

//   // Build a label that NEVER shows voterId
//   const asUserLabel = (u) =>
//     [u.name, u.faculty, u.program, u.symbolNumber ? `Reg: ${u.symbolNumber}` : null]
//       .filter(Boolean)
//       .join(' • ');

//   // Utility to get available options for a slot (allow keeping current selection)
//   function optionsForSlot(currentSelectedId = "") {
//     return verifiedUsers.filter(u => !chosenUserIds.has(u._id) || u._id === currentSelectedId);
//   }

//   // ---------- submit ----------
//   async function handleSubmit(e) {
//     e.preventDefault();
//     if (isSubmitting) return;
//     if (!electionTitle || !startDate || !endDate) {
//       alert("निर्वाचन शीर्षक, सुरू मिति, र अन्त्य मिति अनिवार्य छन्!");
//       return;
//     }

//     try {
//       setIsSubmitting(true);
//       const formData = new FormData();
//       formData.append('electionTitle', electionTitle);
//       formData.append('startDate', startDate);
//       formData.append('endDate', endDate);

//       // IMPORTANT: we keep your existing payload shape (names & files). Names come from selected verified users.
//       const sanitizedPartySections = partySections.map(section => ({
//         partyName: section.partyName || "",
//         candidates: {
//           president:    { name: section.candidates.president.name || "" },
//           vicePresident:{ name: section.candidates.vicePresident.name || "" },
//           secretary:    { name: section.candidates.secretary.name || "" },
//           treasurer:    { name: section.candidates.treasurer.name || "" },
//           members: (section.candidates.members || []).map(m => ({ name: m.name || "" })),
//         },
//       }));
//       formData.append('partySections', JSON.stringify(sanitizedPartySections));

//       const sanitizedIndependents = independents.map(cand => ({
//         post: cand.post || "",
//         name: cand.name || "",
//       }));
//       formData.append('independents', JSON.stringify(sanitizedIndependents));

//       formData.append('samanupatikParties', JSON.stringify(samanupatikParties.filter(Boolean)));

//       // FILES (same keys you already use)
//       partySections.forEach((section, sIdx) => {
//         Object.keys(section.candidates).forEach((key) => {
//           if (key !== 'members') {
//             const f = section.candidates[key].photo;
//             if (f) {
//               formData.append(`partySections[${sIdx}][candidates][${key}][photo]`, f);
//             }
//           } else {
//             (section.candidates.members || []).forEach((member, mIdx) => {
//               if (member.photo) {
//                 formData.append(`partySections[${sIdx}][candidates][members][${mIdx}][photo]`, member.photo);
//               }
//             });
//           }
//         });
//       });

//       independents.forEach((cand, i) => {
//         if (cand.photo) {
//           formData.append(`independents[${i}][photo]`, cand.photo);
//         }
//       });

//       const response = await createElection(formData);
//       console.log('Server response:', response);

//       setElectionTitle("");
//       setStartDate("");
//       setEndDate("");
//       setPartySections([]);
//       setIndependents([]);
//       setSamanupatikParties([]);
//       alert("निर्वाचन सिर्जना सफल भयो!");
//     } catch (error) {
//       console.error('Submission error:', error);
//       const msg =
//         error.response?.data?.message ||
//         error.message ||
//         "Unknown error";
//       alert("निर्वाचन सिर्जना गर्दा त्रुटि: " + msg);
//     } finally {
//       setIsSubmitting(false);
//     }
//   }

//   function getAvailableParties(index) {
//     const chosenExceptCurrent = chosenParties.filter((_, i) => i !== index);
//     return partiesList.filter(p => !chosenExceptCurrent.includes(p));
//   }

//   function getAvailableSamanupatikParties(index) {
//     const chosenExceptCurrent = chosenSamanupatik.filter((_, i) => i !== index);
//     return partiesList.filter(p => !chosenExceptCurrent.includes(p));
//   }

//   // ---------- UI ----------
//   return (
//     <form className="election-form" onSubmit={handleSubmit}>
//       <h2>त्रिभुवन विश्वविद्यालय कलेज निर्वाचन सिर्जना गर्नुहोस्</h2>

//       <label>निर्वाचन शीर्षक</label>
//       <input
//         type="text"
//         value={electionTitle}
//         onChange={e => setElectionTitle(e.target.value)}
//         placeholder="जस्तै: FSU Election 2081"
//         required
//       />

//       <label>सुरू मिति</label>
//       <input
//         type="date"
//         value={startDate}
//         onChange={e => setStartDate(e.target.value)}
//         required
//       />

//       <label>अन्त्य मिति</label>
//       <input
//         type="date"
//         value={endDate}
//         onChange={e => setEndDate(e.target.value)}
//         required
//       />

//       {/* Verified users status */}
//       {loadingUsers && <div className="info">Loading verified students…</div>}
//       {!loadingUsers && usersError && <div className="error">{usersError}</div>}
//       {!loadingUsers && !usersError && verifiedUsers.length === 0 && (
//         <div className="warning">No verified students found. Verify students first.</div>
//       )}

//       <div className="party-sections">
//         <h3>पार्टीको उम्मेदवारहरू</h3>

//         {partySections.map((section, i) => (
//           <div key={i} className="party-section">
//             <select
//               value={section.partyName}
//               onChange={e => changePartyName(i, e.target.value)}
//             >
//               <option value="">-- पार्टी छान्नुहोस् --</option>
//               {getAvailableParties(i).map(p => (
//                 <option key={p} value={p}>{p}</option>
//               ))}
//             </select>

//             {section.partyName && (
//               <>
//                 {posts.map(({ label, key }) => {
//                   const slot = section.candidates[key] || {};
//                   const opts = optionsForSlot(slot.selectedUserId);
//                   return (
//                     <div key={key} className="candidate-section">
//                       <label>{label}</label>

//                       {/* VERIFIED STUDENT DROPDOWN (no voterId displayed) */}
//                       <select
//                         value={slot.selectedUserId || ""}
//                         onChange={(e) => selectCandidateUser(i, key, e.target.value)}
//                         disabled={verifiedUsers.length === 0}
//                       >
//                         <option value="">-- {label} का लागि विद्यार्थी छान्नुहोस् --</option>
//                         {opts.map(u => (
//                           <option key={u._id} value={u._id}>
//                             {asUserLabel(u)}
//                           </option>
//                         ))}
//                       </select>

//                       {/* Optional photo upload (kept) */}
//                       <input
//                         type="file"
//                         accept="image/*"
//                         onChange={e => changeCandidatePhoto(i, key, e.target.files[0])}
//                       />
//                       {slot.preview && (
//                         <img
//                           src={slot.preview}
//                           alt={`${label} preview`}
//                           className="candidate-photo"
//                         />
//                       )}
//                     </div>
//                   );
//                 })}

//                 <div className="members-section">
//                   <label>१२ जना सदस्यहरू</label>
//                   {section.candidates.members.map((member, idx) => {
//                     const opts = optionsForSlot(member.selectedUserId);
//                     return (
//                       <div key={idx} className="member-section">
//                         <select
//                           value={member.selectedUserId || ""}
//                           onChange={(e) => selectCandidateUser(i, "members", e.target.value, idx)}
//                           disabled={verifiedUsers.length === 0}
//                         >
//                           <option value="">-- सदस्य {idx + 1} छान्नुहोस् --</option>
//                           {opts.map(u => (
//                             <option key={u._id} value={u._id}>
//                               {asUserLabel(u)}
//                             </option>
//                           ))}
//                         </select>

//                         <input
//                           type="file"
//                           accept="image/*"
//                           onChange={e => changeCandidatePhoto(i, "members", e.target.files[0], idx)}
//                         />
//                         {member.preview && (
//                           <img
//                             src={member.preview}
//                             alt={`सदस्य ${idx + 1} preview`}
//                             className="candidate-photo"
//                           />
//                         )}
//                       </div>
//                     );
//                   })}
//                 </div>
//               </>
//             )}
//           </div>
//         ))}

//         <button
//           type="button"
//           onClick={addPartySection}
//           className="add-button"
//         >
//           + अर्को पार्टी थप्नुहोस्
//         </button>
//       </div>

//       <div className="independent-section">
//         <h3>स्वतन्त्र उम्मेदवारहरू</h3>
//         {independents.map((cand, idx) => {
//           const opts = optionsForSlot(cand.selectedUserId);
//           return (
//             <div key={idx} className="independent-candidate">
//               <label>पद</label>
//               <select
//                 value={cand.post}
//                 onChange={e => changeIndependentField(idx, "post", e.target.value)}
//               >
//                 <option value="">-- पद छान्नुहोस् --</option>
//                 {posts.map(({ label, key }) => (
//                   <option key={key} value={key}>{label}</option>
//                 ))}
//                 <option value="members">सदस्य</option>
//               </select>

//               {/* VERIFIED STUDENT DROPDOWN */}
//               <select
//                 value={cand.selectedUserId || ""}
//                 onChange={(e) => selectIndependentUser(idx, e.target.value)}
//                 disabled={verifiedUsers.length === 0}
//               >
//                 <option value="">-- उम्मेदवार छान्नुहोस् --</option>
//                 {opts.map(u => (
//                   <option key={u._id} value={u._id}>
//                     {asUserLabel(u)}
//                   </option>
//                 ))}
//               </select>

//               {/* Optional photo upload for independents */}
//               <input
//                 type="file"
//                 accept="image/*"
//                 onChange={e => changeIndependentPhoto(idx, e.target.files[0])}
//               />
//               {cand.preview && (
//                 <img
//                   src={cand.preview}
//                   alt="स्वतन्त्र उम्मेदवार फोटो"
//                   className="candidate-photo"
//                 />
//               )}
//             </div>
//           );
//         })}

//         <button
//           type="button"
//           onClick={addIndependent}
//           className="add-button"
//         >
//           + स्वतन्त्र उम्मेदवार थप्नुहोस्
//         </button>
//       </div>

//       <div className="samanupatik-section">
//         <h3>समानुपातिक निर्वाचन (पार्टीको नाम चयन गर्नुहोस्)</h3>
//         {samanupatikParties.map((party, i) => (
//           <select
//             key={i}
//             value={party}
//             onChange={e => changeSamanupatikParty(i, e.target.value)}
//           >
//             <option value="">-- पार्टी छान्नुहोस् --</option>
//             {getAvailableSamanupatikParties(i).map(p => (
//               <option key={p} value={p}>{p}</option>
//             ))}
//           </select>
//         ))}
//         <button
//           type="button"
//           onClick={addSamanupatikParty}
//           className="add-button"
//         >
//           + पार्टी थप्नुहोस्
//         </button>
//       </div>

//       <button
//         type="submit"
//         className="submit-button"
//         disabled={isSubmitting}
//       >
//         {isSubmitting ? "Submitting..." : "निर्वाचन सिर्जना गर्नुहोस्"}
//       </button>
//     </form>
//   );
// }





import React, { useEffect, useMemo, useState } from 'react';
import './ElectionForm.css';
import api, { createElection } from '../api';

const partiesList = [
  "अनेरास्ववियू (CPN-UML)", "अनेरास्ववियू (पाँचौं)", "अनेरास्ववियू (एकीकृत समाजवादी)", "क्रान्तिकारी (माओवादी केन्द्र)",
  "क्रान्तिकारी–बहुमत", "क्रान्तिकारी–वैद्य", "अखिल समाजवादी", "अनेरास्ववियू (छैठौं)", "नेविसंघ (Nepali Congress)",
  "लोकतान्त्रिक विद्यार्थी संघ", "नागरिक विद्यार्थी समाज", "राष्ट्रिय प्रजातान्त्रिक संगठन", "राष्ट्रिय प्रजातान्त्रिक संगठन, नेपाल",
  "नेशनल स्टूडेन्ट फोरम", "नेशनल स्टूडेन्ट्स यूनियन", "नया शक्ति युनियन", "विद्यार्थी मोर्चा", "क्रान्तिकारी विद्यार्थी युनियन",
  "वैज्ञानिक समाजवादी फ्रन्ट", "वैज्ञानिक समाजवादी संगठन", "समाजवादी विद्यार्थी युनियन", "समाजवादी युनियन, नेपाल", "विद्यार्थी जनमत संघ"
];

const posts = [
  { label: "राष्ट्रपति", key: "president" },
  { label: "उप-राष्ट्रपति", key: "vicePresident" },
  { label: "सचिव", key: "secretary" },
  { label: "कोषाध्यक्ष", key: "treasurer" }
];

export default function ElectionForm() {
  const [electionTitle, setElectionTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // verified students for dropdown
  const [verifiedUsers, setVerifiedUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [usersError, setUsersError] = useState("");

  // party sections & independents
  const [partySections, setPartySections] = useState([]);
  const [independents, setIndependents] = useState([]);
  const [samanupatikParties, setSamanupatikParties] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const chosenParties = partySections.map(p => p.partyName).filter(Boolean);
  const chosenSamanupatik = samanupatikParties.filter(Boolean);

  // ---------- load verified students (NO voterId in labels) ----------
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoadingUsers(true);
        setUsersError("");
        const res = await api.get('/api/users/verified');
        const list = Array.isArray(res.data) ? res.data : [];
        const clean = list.map(u => ({
          _id: String(u._id),
          name: u.name,
          faculty: u.faculty || '',
          program: u.program || '',
          symbolNumber: u.symbolNumber || '',
          photo: u.photo || '',
        }));
        if (alive) setVerifiedUsers(clean);
      } catch (e) {
        if (alive) setUsersError(e.response?.data?.error || e.message || 'Failed to load verified users');
      } finally {
        if (alive) setLoadingUsers(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  function validateFile(file) {
    const filetypes = /jpeg|jpg|png/;
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (!filetypes.test(file.type)) {
      alert("केवल JPEG, JPG, वा PNG फाइलहरू अनुमति छन्!");
      return false;
    }
    if (file.size > maxSize) {
      alert("फाइलको साइज ५ MB भन्दा कम हुनुपर्छ!");
      return false;
    }
    return true;
  }

  function addPartySection() {
    setPartySections(prev => [...prev, {
      partyName: "",
      candidates: {
        president:    { name: "", photo: null, preview: null, selectedUserId: "" },
        vicePresident:{ name: "", photo: null, preview: null, selectedUserId: "" },
        secretary:    { name: "", photo: null, preview: null, selectedUserId: "" },
        treasurer:    { name: "", photo: null, preview: null, selectedUserId: "" },
        members: Array(12).fill(null).map(() => ({ name: "", photo: null, preview: null, selectedUserId: "" }))
      }
    }]);
  }

  function changePartyName(index, value) {
    if (chosenParties.includes(value) && value !== partySections[index].partyName) return;
    setPartySections(prev => {
      const copy = [...prev];
      copy[index].partyName = value;
      return copy;
    });
  }

  function changeCandidatePhoto(sectionIndex, postKey, file, memberIndex = null) {
    if (file && !validateFile(file)) return;
    setPartySections(prev => {
      const copy = [...prev];
      const section = copy[sectionIndex];
      if (postKey === "members" && memberIndex !== null) {
        const newMembers = [...section.candidates.members];
        newMembers[memberIndex].photo = file || null;
        newMembers[memberIndex].preview = file ? URL.createObjectURL(file) : null;
        section.candidates.members = newMembers;
      } else {
        section.candidates[postKey].photo = file || null;
        section.candidates[postKey].preview = file ? URL.createObjectURL(file) : null;
      }
      return copy;
    });
  }

  function selectCandidateUser(sectionIndex, postKey, userId, memberIndex = null) {
    setPartySections(prev => {
      const copy = [...prev];
      const section = copy[sectionIndex];

      const u = verifiedUsers.find(x => x._id === userId) || null;
      const name = u ? u.name : "";

      if (postKey === "members" && memberIndex !== null) {
        const arr = [...section.candidates.members];
        arr[memberIndex] = {
          ...arr[memberIndex],
          selectedUserId: userId || "",
          name,
        };
        section.candidates.members = arr;
      } else {
        section.candidates[postKey] = {
          ...section.candidates[postKey],
          selectedUserId: userId || "",
          name,
        };
      }
      return copy;
    });
  }

  // Independents
  function addIndependent() {
    setIndependents(prev => [...prev, { post: "", selectedUserId: "", name: "", photo: null, preview: null }]);
  }

  function changeIndependentField(index, field, value) {
    setIndependents(prev => {
      const copy = [...prev];
      copy[index][field] = value;
      return copy;
    });
  }

  function changeIndependentPhoto(index, file) {
    if (file && !validateFile(file)) return;
    setIndependents(prev => {
      const copy = [...prev];
      copy[index].photo = file || null;
      copy[index].preview = file ? URL.createObjectURL(file) : null;
      return copy;
    });
  }

  function selectIndependentUser(index, userId) {
    setIndependents(prev => {
      const copy = [...prev];
      const u = verifiedUsers.find(x => x._id === userId) || null;
      copy[index].selectedUserId = userId || "";
      copy[index].name = u ? u.name : "";
      return copy;
    });
  }

  function addSamanupatikParty() {
    setSamanupatikParties(prev => [...prev, ""]);
  }

  function changeSamanupatikParty(index, value) {
    if (chosenSamanupatik.includes(value) && value !== samanupatikParties[index]) return;
    setSamanupatikParties(prev => {
      const copy = [...prev];
      copy[index] = value;
      return copy;
    });
  }

  // One person, one position (client-side guard)
  const chosenUserIds = useMemo(() => {
    const set = new Set();
    for (const section of partySections) {
      const c = section.candidates || {};
      ['president','vicePresident','secretary','treasurer'].forEach(k => {
        const sid = c[k]?.selectedUserId;
        if (sid) set.add(sid);
      });
      for (const m of c.members || []) {
        if (m?.selectedUserId) set.add(m.selectedUserId);
      }
    }
    for (const ind of independents) {
      if (ind?.selectedUserId) set.add(ind.selectedUserId);
    }
    return set;
  }, [partySections, independents]);

  const asUserLabel = (u) =>
    [u.name, u.faculty, u.program, u.symbolNumber ? `Reg: ${u.symbolNumber}` : null]
      .filter(Boolean)
      .join(' • ');

  function optionsForSlot(currentSelectedId = "") {
    return verifiedUsers.filter(u => !chosenUserIds.has(u._id) || u._id === currentSelectedId);
  }

  // async function handleSubmit(e) {
  //   e.preventDefault();
  //   if (isSubmitting) return;
  //   if (!electionTitle || !startDate || !endDate) {
  //     alert("निर्वाचन शीर्षक, सुरू मिति, र अन्त्य मिति अनिवार्य छन्!");
  //     return;
  //   }

  //   try {
  //     setIsSubmitting(true);
  //     const formData = new FormData();
  //     formData.append('electionTitle', electionTitle);
  //     formData.append('startDate', startDate);
  //     formData.append('endDate', endDate);

  //     // ✅ Include candidateUserId for every slot
  //     const sanitizedPartySections = partySections.map(section => ({
  //       partyName: section.partyName || "",
  //       candidates: {
  //         president:    { name: section.candidates.president.name || "",    candidateUserId: section.candidates.president.selectedUserId || null },
  //         vicePresident:{ name: section.candidates.vicePresident.name || "", candidateUserId: section.candidates.vicePresident.selectedUserId || null },
  //         secretary:    { name: section.candidates.secretary.name || "",    candidateUserId: section.candidates.secretary.selectedUserId || null },
  //         treasurer:    { name: section.candidates.treasurer.name || "",    candidateUserId: section.candidates.treasurer.selectedUserId || null },
  //         members: (section.candidates.members || []).map(m => ({
  //           name: m.name || "",
  //           candidateUserId: m.selectedUserId || null
  //         })),
  //       },
  //     }));
  //     formData.append('partySections', JSON.stringify(sanitizedPartySections));

  //     const sanitizedIndependents = independents.map(cand => ({
  //       post: cand.post || "",
  //       name: cand.name || "",
  //       candidateUserId: cand.selectedUserId || null,
  //     }));
  //     formData.append('independents', JSON.stringify(sanitizedIndependents));

  //     formData.append('samanupatikParties', JSON.stringify(samanupatikParties.filter(Boolean)));

  //     // FILES keep same keys
  //     partySections.forEach((section, sIdx) => {
  //       Object.keys(section.candidates).forEach((key) => {
  //         if (key !== 'members') {
  //           const f = section.candidates[key].photo;
  //           if (f) formData.append(`partySections[${sIdx}][candidates][${key}][photo]`, f);
  //         } else {
  //           (section.candidates.members || []).forEach((member, mIdx) => {
  //             if (member.photo) {
  //               formData.append(`partySections[${sIdx}][candidates][members][${mIdx}][photo]`, member.photo);
  //             }
  //           });
  //         }
  //       });
  //     });

  //     independents.forEach((cand, i) => {
  //       if (cand.photo) {
  //         formData.append(`independents[${i}][photo]`, cand.photo);
  //       }
  //     });

  //     const response = await createElection(formData);
  //     console.log('Server response:', response);

  //     setElectionTitle("");
  //     setStartDate("");
  //     setEndDate("");
  //     setPartySections([]);
  //     setIndependents([]);
  //     setSamanupatikParties([]);
  //     alert("निर्वाचन सिर्जना सफल भयो!");
  //   } catch (error) {
  //     console.error('Submission error:', error);
  //     const msg = error.response?.data?.message || error.message || "Unknown error";
  //     alert("निर्वाचन सिर्जना गर्दा त्रुटि: " + msg);
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // }

  // ---------- submit ----------
async function handleSubmit(e) {
  e.preventDefault();
  if (isSubmitting) return;
  if (!electionTitle || !startDate || !endDate) {
    alert("निर्वाचन शीर्षक, सुरू मिति, र अन्त्य मिति अनिवार्य छन्!");
    return;
  }

  try {
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('electionTitle', electionTitle);
    formData.append('startDate', startDate);
    formData.append('endDate', endDate);

    // ✅ Include candidateUserId everywhere; keep name too
    const sanitizedPartySections = partySections.map(section => ({
      partyName: section.partyName || "",
      candidates: {
        president: {
          name: section.candidates.president.name || "",
          candidateUserId: section.candidates.president.selectedUserId || ""
        },
        vicePresident: {
          name: section.candidates.vicePresident.name || "",
          candidateUserId: section.candidates.vicePresident.selectedUserId || ""
        },
        secretary: {
          name: section.candidates.secretary.name || "",
          candidateUserId: section.candidates.secretary.selectedUserId || ""
        },
        treasurer: {
          name: section.candidates.treasurer.name || "",
          candidateUserId: section.candidates.treasurer.selectedUserId || ""
        },
        members: (section.candidates.members || []).map(m => ({
          name: m.name || "",
          candidateUserId: m.selectedUserId || ""
        })),
      },
    }));
    formData.append('partySections', JSON.stringify(sanitizedPartySections));

    // ✅ Independents: include candidateUserId too
    const sanitizedIndependents = independents.map(cand => ({
      post: cand.post || "",
      name: cand.name || "",
      candidateUserId: cand.selectedUserId || ""
    }));
    formData.append('independents', JSON.stringify(sanitizedIndependents));

    formData.append('samanupatikParties', JSON.stringify(samanupatikParties.filter(Boolean)));

    // FILES (unchanged)
    partySections.forEach((section, sIdx) => {
      Object.keys(section.candidates).forEach((key) => {
        if (key !== 'members') {
          const f = section.candidates[key].photo;
          if (f) formData.append(`partySections[${sIdx}][candidates][${key}][photo]`, f);
        } else {
          (section.candidates.members || []).forEach((member, mIdx) => {
            if (member.photo) {
              formData.append(`partySections[${sIdx}][candidates][members][${mIdx}][photo]`, member.photo);
            }
          });
        }
      });
    });

    independents.forEach((cand, i) => {
      if (cand.photo) formData.append(`independents[${i}][photo]`, cand.photo);
    });

    const response = await createElection(formData);
    console.log('Server response:', response);

    setElectionTitle("");
    setStartDate("");
    setEndDate("");
    setPartySections([]);
    setIndependents([]);
    setSamanupatikParties([]);
    alert("निर्वाचन सिर्जना सफल भयो!");
  } catch (error) {
    console.error('Submission error:', error);
    const msg = error.response?.data?.message || error.message || "Unknown error";
    alert("निर्वाचन सिर्जना गर्दा त्रुटि: " + msg);
  } finally {
    setIsSubmitting(false);
  }
}


  function getAvailableParties(index) {
    const chosenExceptCurrent = chosenParties.filter((_, i) => i !== index);
    return partiesList.filter(p => !chosenExceptCurrent.includes(p));
  }

  function getAvailableSamanupatikParties(index) {
    const chosenExceptCurrent = chosenSamanupatik.filter((_, i) => i !== index);
    return partiesList.filter(p => !chosenExceptCurrent.includes(p));
  }

  return (
    <form className="election-form" onSubmit={handleSubmit}>
      <h2>त्रिभुवन विश्वविद्यालय कलेज निर्वाचन सिर्जना गर्नुहोस्</h2>

      <label>निर्वाचन शीर्षक</label>
      <input
        type="text"
        value={electionTitle}
        onChange={e => setElectionTitle(e.target.value)}
        placeholder="जस्तै: FSU Election 2081"
        required
      />

      <label>सुरू मिति</label>
      <input
        type="date"
        value={startDate}
        onChange={e => setStartDate(e.target.value)}
        required
      />

      <label>अन्त्य मिति</label>
      <input
        type="date"
        value={endDate}
        onChange={e => setEndDate(e.target.value)}
        required
      />

      {loadingUsers && <div className="info">Loading verified students…</div>}
      {!loadingUsers && usersError && <div className="error">{usersError}</div>}
      {!loadingUsers && !usersError && verifiedUsers.length === 0 && (
        <div className="warning">No verified students found. Verify students first.</div>
      )}

      <div className="party-sections">
        <h3>पार्टीको उम्मेदवारहरू</h3>

        {partySections.map((section, i) => (
          <div key={i} className="party-section">
            <select
              value={section.partyName}
              onChange={e => changePartyName(i, e.target.value)}
            >
              <option value="">-- पार्टी छान्नुहोस् --</option>
              {getAvailableParties(i).map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>

            {section.partyName && (
              <>
                {posts.map(({ label, key }) => {
                  const slot = section.candidates[key] || {};
                  const opts = optionsForSlot(slot.selectedUserId);
                  return (
                    <div key={key} className="candidate-section">
                      <label>{label}</label>

                      <select
                        value={slot.selectedUserId || ""}
                        onChange={(e) => selectCandidateUser(i, key, e.target.value)}
                        disabled={verifiedUsers.length === 0}
                      >
                        <option value="">-- {label} का लागि विद्यार्थी छान्नुहोस् --</option>
                        {opts.map(u => (
                          <option key={u._id} value={u._id}>
                            {asUserLabel(u)}
                          </option>
                        ))}
                      </select>

                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => changeCandidatePhoto(i, key, e.target.files[0])}
                      />
                      {slot.preview && (
                        <img
                          src={slot.preview}
                          alt={`${label} preview`}
                          className="candidate-photo"
                        />
                      )}
                    </div>
                  );
                })}

                <div className="members-section">
                  <label>१२ जना सदस्यहरू</label>
                  {section.candidates.members.map((member, idx) => {
                    const opts = optionsForSlot(member.selectedUserId);
                    return (
                      <div key={idx} className="member-section">
                        <select
                          value={member.selectedUserId || ""}
                          onChange={(e) => selectCandidateUser(i, "members", e.target.value, idx)}
                          disabled={verifiedUsers.length === 0}
                        >
                          <option value="">-- सदस्य {idx + 1} छान्नुहोस् --</option>
                          {opts.map(u => (
                            <option key={u._id} value={u._id}>
                              {asUserLabel(u)}
                            </option>
                          ))}
                        </select>

                        <input
                          type="file"
                          accept="image/*"
                          onChange={e => changeCandidatePhoto(i, "members", e.target.files[0], idx)}
                        />
                        {member.preview && (
                          <img
                            src={member.preview}
                            alt={`सदस्य ${idx + 1} preview`}
                            className="candidate-photo"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        ))}

        <button type="button" onClick={addPartySection} className="add-button">
          + अर्को पार्टी थप्नुहोस्
        </button>
      </div>

      <div className="independent-section">
        <h3>स्वतन्त्र उम्मेदवारहरू</h3>
        {independents.map((cand, idx) => {
          const opts = optionsForSlot(cand.selectedUserId);
          return (
            <div key={idx} className="independent-candidate">
              <label>पद</label>
              <select
                value={cand.post}
                onChange={e => changeIndependentField(idx, "post", e.target.value)}
              >
                <option value="">-- पद छान्नुहोस् --</option>
                {posts.map(({ label, key }) => (
                  <option key={key} value={key}>{label}</option>
                ))}
                <option value="members">सदस्य</option>
              </select>

              <select
                value={cand.selectedUserId || ""}
                onChange={(e) => selectIndependentUser(idx, e.target.value)}
                disabled={verifiedUsers.length === 0}
              >
                <option value="">-- उम्मेदवार छान्नुहोस् --</option>
                {opts.map(u => (
                  <option key={u._id} value={u._id}>
                    {asUserLabel(u)}
                  </option>
                ))}
              </select>

              <input
                type="file"
                accept="image/*"
                onChange={e => changeIndependentPhoto(idx, e.target.files[0])}
              />
              {cand.preview && (
                <img
                  src={cand.preview}
                  alt="स्वतन्त्र उम्मेदवार फोटो"
                  className="candidate-photo"
                />
              )}
            </div>
          );
        })}

        <button type="button" onClick={addIndependent} className="add-button">
          + स्वतन्त्र उम्मेदवार थप्नुहोस्
        </button>
      </div>

      <div className="samanupatik-section">
        <h3>समानुपातिक निर्वाचन (पार्टीको नाम चयन गर्नुहोस्)</h3>
        {samanupatikParties.map((party, i) => (
          <select
            key={i}
            value={party}
            onChange={e => changeSamanupatikParty(i, e.target.value)}
          >
            <option value="">-- पार्टी छान्नुहोस् --</option>
            {getAvailableSamanupatikParties(i).map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        ))}
        <button type="button" onClick={addSamanupatikParty} className="add-button">
          + पार्टी थप्नुहोस्
        </button>
      </div>

      <button type="submit" className="submit-button" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "निर्वाचन सिर्जना गर्नुहोस्"}
      </button>
    </form>
  );
}
