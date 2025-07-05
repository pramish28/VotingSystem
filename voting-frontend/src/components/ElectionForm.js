// import React, { useState } from 'react';
// import './ElectionForm.css';
// import { createElection } from '../api';

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
//   const [partySections, setPartySections] = useState([]);
//   const [independents, setIndependents] = useState([]);
//   const [samanupatikParties, setSamanupatikParties] = useState([]);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const chosenParties = partySections.map(p => p.partyName).filter(Boolean);
//   const chosenSamanupatik = samanupatikParties.filter(Boolean);

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
//         president: { name: "", photo: null, preview: null },
//         vicePresident: { name: "", photo: null, preview: null },
//         secretary: { name: "", photo: null, preview: null },
//         treasurer: { name: "", photo: null, preview: null },
//         members: Array(12).fill(null).map(() => ({ name: "", photo: null, preview: null }))
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

//   function changeCandidate(index, postKey, value, isPhoto = false, memberIndex = null) {
//     if (isPhoto && value && !validateFile(value)) return;
//     setPartySections(prev => {
//       const copy = [...prev];
//       const section = copy[index];
//       if (postKey === "members" && memberIndex !== null) {
//         const newMembers = [...section.candidates.members];
//         if (isPhoto) {
//           newMembers[memberIndex].photo = value;
//           newMembers[memberIndex].preview = value ? URL.createObjectURL(value) : null;
//         } else {
//           newMembers[memberIndex].name = value;
//         }
//         section.candidates.members = newMembers;
//       } else {
//         if (isPhoto) {
//           section.candidates[postKey].photo = value;
//           section.candidates[postKey].preview = value ? URL.createObjectURL(value) : null;
//         } else {
//           section.candidates[postKey].name = value;
//         }
//       }
//       return copy;
//     });
//   }

//   function addIndependent() {
//     setIndependents(prev => [...prev, { post: "", name: "", photo: null, preview: null }]);
//   }

//   function changeIndependent(index, field, value, isPhoto = false) {
//     if (isPhoto && value && !validateFile(value)) return;
//     setIndependents(prev => {
//       const copy = [...prev];
//       if (isPhoto) {
//         copy[index][field] = value;
//         copy[index].preview = value ? URL.createObjectURL(value) : null;
//       } else {
//         copy[index][field] = value;
//       }
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

//       const sanitizedPartySections = partySections.map(section => ({
//         partyName: section.partyName || "",
//         candidates: {
//           president: { name: section.candidates.president.name || "" },
//           vicePresident: { name: section.candidates.vicePresident.name || "" },
//           secretary: { name: section.candidates.secretary.name || "" },
//           treasurer: { name: section.candidates.treasurer.name || "" },
//           members: section.candidates.members.map(member => ({ name: member.name || "" })),
//         },
//       }));
//       formData.append('partySections', JSON.stringify(sanitizedPartySections));

//       const sanitizedIndependents = independents.map(cand => ({
//         post: cand.post || "",
//         name: cand.name || "",
//       }));
//       formData.append('independents', JSON.stringify(sanitizedIndependents));

//       formData.append('samanupatikParties', JSON.stringify(samanupatikParties.filter(party => party)));

//       partySections.forEach((section, index) => {
//         Object.keys(section.candidates).forEach((key) => {
//           if (key !== 'members') {
//             if (section.candidates[key].photo) {
//               formData.append(`partySections[${index}][candidates][${key}][photo]`, section.candidates[key].photo);
//             }
//           } else {
//             section.candidates.members.forEach((member, memberIndex) => {
//               if (member.photo) {
//                 formData.append(`partySections[${index}][candidates][members][${memberIndex}][photo]`, member.photo);
//               }
//             });
//           }
//         });
//       });

//       independents.forEach((cand, index) => {
//         if (cand.photo) {
//           formData.append(`independents[${index}][photo]`, cand.photo);
//         }
//       });

//       console.log('FormData contents:');
//       for (let [key, value] of formData.entries()) {
//         console.log(`${key}: ${value instanceof File ? value.name : value}`);
//       }

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
//       console.error('Error details:', error.response?.status, error.response?.data || error.message);
//       let errorMessage = "निर्वाचन सिर्जना गर्दा त्रुटि: ";
//       if (error.response?.status === 404) {
//         errorMessage += "Backend endpoint not found. Please ensure the server is running on http://localhost:5000/api and the /api/election/create route is correctly set up.";
//       } else if (error.response?.status === 401) {
//         errorMessage += "Authentication failed. Please log in again.";
//       } else if (error.response?.status === 400) {
//         errorMessage += error.response?.data?.message || "Invalid data sent to the server.";
//       } else {
//         errorMessage += error.response?.data?.message || error.message || "Unknown error";
//       }
//       alert(errorMessage);
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
//                   const candidate = section.candidates[key];
//                   return (
//                     <div key={key} className="candidate-section">
//                       <label>{label}</label>
//                       <input
//                         type="text"
//                         placeholder={`${label} उम्मेदवारको नाम`}
//                         value={candidate.name}
//                         onChange={e => changeCandidate(i, key, e.target.value)}
//                       />
//                       <input
//                         type="file"
//                         accept="image/*"
//                         onChange={e => changeCandidate(i, key, e.target.files[0], true)}
//                       />
//                       {candidate.preview && (
//                         <img
//                           src={candidate.preview}
//                           alt={`${label} preview`}
//                           className="candidate-photo"
//                         />
//                       )}
//                     </div>
//                   );
//                 })}

//                 <div className="members-section">
//                   <label>१२ जना सदस्यहरू</label>
//                   {section.candidates.members.map((member, idx) => (
//                     <div key={idx} className="member-section">
//                       <input
//                         type="text"
//                         placeholder={`सदस्य ${idx + 1} को नाम`}
//                         value={member.name}
//                         onChange={e => changeCandidate(i, "members", e.target.value, false, idx)}
//                       />
//                       <input
//                         type="file"
//                         accept="image/*"
//                         onChange={e => changeCandidate(i, "members", e.target.files[0], true, idx)}
//                       />
//                       {member.preview && (
//                         <img
//                           src={member.preview}
//                           alt={`सदस्य ${idx + 1} preview`}
//                           className="candidate-photo"
//                         />
//                       )}
//                     </div>
//                   ))}
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
//         {independents.map((cand, idx) => (
//           <div key={idx} className="independent-candidate">
//             <label>पद</label>
//             <select
//               value={cand.post}
//               onChange={e => changeIndependent(idx, "post", e.target.value)}
//             >
//               <option value="">-- पद छान्नुहोस् --</option>
//               {posts.map(({ label, key }) => (
//                 <option key={key} value={key}>{label}</option>
//               ))}
//               <option value="members">सदस्य</option>
//             </select>

//             <input
//               type="text"
//               placeholder="नाम"
//               value={cand.name}
//               onChange={e => changeIndependent(idx, "name", e.target.value)}
//             />

//             <input
//               type="file"
//               accept="image/*"
//               onChange={e => changeIndependent(idx, "photo", e.target.files[0], true)}
//             />
//             {cand.preview && (
//               <img
//                 src={cand.preview}
//                 alt="स्वतन्त्र उम्मेदवार फोटो"
//                 className="candidate-photo"
//               />
//             )}
//           </div>
//         ))}

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
import React, { useState } from 'react';
   import './ElectionForm.css';
   import { createElection } from '../api';

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
     const [partySections, setPartySections] = useState([]);
     const [independents, setIndependents] = useState([]);
     const [samanupatikParties, setSamanupatikParties] = useState([]);
     const [isSubmitting, setIsSubmitting] = useState(false);

     const chosenParties = partySections.map(p => p.partyName).filter(Boolean);
     const chosenSamanupatik = samanupatikParties.filter(Boolean);

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
           president: { name: "", photo: null, preview: null },
           vicePresident: { name: "", photo: null, preview: null },
           secretary: { name: "", photo: null, preview: null },
           treasurer: { name: "", photo: null, preview: null },
           members: Array(12).fill(null).map(() => ({ name: "", photo: null, preview: null }))
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

     function changeCandidate(index, postKey, value, isPhoto = false, memberIndex = null) {
       if (isPhoto && value && !validateFile(value)) return;
       setPartySections(prev => {
         const copy = [...prev];
         const section = copy[index];
         if (postKey === "members" && memberIndex !== null) {
           const newMembers = [...section.candidates.members];
           if (isPhoto) {
             newMembers[memberIndex].photo = value;
             newMembers[memberIndex].preview = value ? URL.createObjectURL(value) : null;
           } else {
             newMembers[memberIndex].name = value;
           }
           section.candidates.members = newMembers;
         } else {
           if (isPhoto) {
             section.candidates[postKey].photo = value;
             section.candidates[postKey].preview = value ? URL.createObjectURL(value) : null;
           } else {
             section.candidates[postKey].name = value;
           }
         }
         return copy;
       });
     }

     function addIndependent() {
       setIndependents(prev => [...prev, { post: "", name: "", photo: null, preview: null }]);
     }

     function changeIndependent(index, field, value, isPhoto = false) {
       if (isPhoto && value && !validateFile(value)) return;
       setIndependents(prev => {
         const copy = [...prev];
         if (isPhoto) {
           copy[index][field] = value;
           copy[index].preview = value ? URL.createObjectURL(value) : null;
         } else {
           copy[index][field] = value;
         }
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

         const sanitizedPartySections = partySections.map(section => ({
           partyName: section.partyName || "",
           candidates: {
             president: { name: section.candidates.president.name || "" },
             vicePresident: { name: section.candidates.vicePresident.name || "" },
             secretary: { name: section.candidates.secretary.name || "" },
             treasurer: { name: section.candidates.treasurer.name || "" },
             members: section.candidates.members.map(member => ({ name: member.name || "" })),
           },
         }));
         formData.append('partySections', JSON.stringify(sanitizedPartySections));

         const sanitizedIndependents = independents.map(cand => ({
           post: cand.post || "",
           name: cand.name || "",
         }));
         formData.append('independents', JSON.stringify(sanitizedIndependents));

         formData.append('samanupatikParties', JSON.stringify(samanupatikParties.filter(party => party)));

         partySections.forEach((section, index) => {
           Object.keys(section.candidates).forEach((key) => {
             if (key !== 'members') {
               if (section.candidates[key].photo) {
                 formData.append(`partySections[${index}][candidates][${key}][photo]`, section.candidates[key].photo);
               }
             } else {
               section.candidates.members.forEach((member, memberIndex) => {
                 if (member.photo) {
                   formData.append(`partySections[${index}][candidates][members][${memberIndex}][photo]`, member.photo);
                 }
               });
             }
           });
         });

         independents.forEach((cand, index) => {
           if (cand.photo) {
             formData.append(`independents[${index}][photo]`, cand.photo);
           }
         });

         console.log('FormData contents:');
         for (let [key, value] of formData.entries()) {
           console.log(`${key}: ${value instanceof File ? value.name : value}`);
         }

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
         console.error('Error details:', error.response?.status, error.response?.data || error.message);
         let errorMessage = "निर्वाचन सिर्जना गर्दा त्रुटि: ";
         if (error.response?.status === 401) {
           errorMessage += "Authentication failed. Please log in again.";
         } else if (error.response?.status === 400) {
           errorMessage += error.response?.data?.message || "Invalid data sent to the server.";
         } else {
           errorMessage += error.response?.data?.message || error.message || "Unknown error";
         }
         alert(errorMessage);
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
                     const candidate = section.candidates[key];
                     return (
                       <div key={key} className="candidate-section">
                         <label>{label}</label>
                         <input
                           type="text"
                           placeholder={`${label} उम्मेदवारको नाम`}
                           value={candidate.name}
                           onChange={e => changeCandidate(i, key, e.target.value)}
                         />
                         <input
                           type="file"
                           accept="image/*"
                           onChange={e => changeCandidate(i, key, e.target.files[0], true)}
                         />
                         {candidate.preview && (
                           <img
                             src={candidate.preview}
                             alt={`${label} preview`}
                             className="candidate-photo"
                           />
                         )}
                       </div>
                     );
                   })}

                   <div className="members-section">
                     <label>१२ जना सदस्यहरू</label>
                     {section.candidates.members.map((member, idx) => (
                       <div key={idx} className="member-section">
                         <input
                           type="text"
                           placeholder={`सदस्य ${idx + 1} को नाम`}
                           value={member.name}
                           onChange={e => changeCandidate(i, "members", e.target.value, false, idx)}
                         />
                         <input
                           type="file"
                           accept="image/*"
                           onChange={e => changeCandidate(i, "members", e.target.files[0], true, idx)}
                         />
                         {member.preview && (
                           <img
                             src={member.preview}
                             alt={`सदस्य ${idx + 1} preview`}
                             className="candidate-photo"
                           />
                         )}
                       </div>
                     ))}
                   </div>
                 </>
               )}
             </div>
           ))}

           <button
             type="button"
             onClick={addPartySection}
             className="add-button"
           >
             + अर्को पार्टी थप्नुहोस्
           </button>
         </div>

         <div className="independent-section">
           <h3>स्वतन्त्र उम्मेदवारहरू</h3>
           {independents.map((cand, idx) => (
             <div key={idx} className="independent-candidate">
               <label>पद</label>
               <select
                 value={cand.post}
                 onChange={e => changeIndependent(idx, "post", e.target.value)}
               >
                 <option value="">-- पद छान्नुहोस् --</option>
                 {posts.map(({ label, key }) => (
                   <option key={key} value={key}>{label}</option>
                 ))}
                 <option value="members">सदस्य</option>
               </select>

               <input
                 type="text"
                 placeholder="नाम"
                 value={cand.name}
                 onChange={e => changeIndependent(idx, "name", e.target.value)}
               />

               <input
                 type="file"
                 accept="image/*"
                 onChange={e => changeIndependent(idx, "photo", e.target.files[0], true)}
               />
               {cand.preview && (
                 <img
                   src={cand.preview}
                   alt="स्वतन्त्र उम्मेदवार फोटो"
                   className="candidate-photo"
                 />
               )}
             </div>
           ))}

           <button
             type="button"
             onClick={addIndependent}
             className="add-button"
           >
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
           <button
             type="button"
             onClick={addSamanupatikParty}
             className="add-button"
           >
             + पार्टी थप्नुहोस्
           </button>
         </div>

         <button
           type="submit"
           className="submit-button"
           disabled={isSubmitting}
         >
           {isSubmitting ? "Submitting..." : "निर्वाचन सिर्जना गर्नुहोस्"}
         </button>
       </form>
     );
   }