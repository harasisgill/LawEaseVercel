import React, { useEffect, useState } from "react";
import Header from "../layout/Header";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext";
import axios from "axios";
import Select from "react-select";

const Profile = () => {
  const navigate = useNavigate();
  const { lawyer_id } = useParams();
  const { user } = useAuthContext();

  const [lawyer, setLawyer] = useState(null);
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [experience, setExperience] = useState("");
  const [categoryOptions, setCategoryOptions] = useState([]); // Options for the category select
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [city, setCity] = useState("");
  const [bio, setBio] = useState("");
  const [dp, setDp] = useState("");
  const [fileHandler, setFileHandler] = useState(null);

  const fetchLawyer = async () => {
    try {
      const response = await axios.get(
        `http://localhost:4000/api/lawyer/getLawyer/${lawyer_id}`
      );
      const fetchedLawyer = response.data;

      setLawyer(fetchedLawyer);
      setFirstname(fetchedLawyer.firstname);
      setLastname(fetchedLawyer.lastname);
      setExperience(fetchedLawyer.experience);
      setCity(fetchedLawyer.city);
      setBio(fetchedLawyer.bio);
      setDp(fetchedLawyer.image);

      // Prepare category options from fetched lawyer data
      const initialCategories = fetchedLawyer.category.map((cat) => ({
        value: cat,
        label: cat,
      }));
      setSelectedCategories(initialCategories);
      setCategoryOptions(initialCategories); // Set options for the select
    } catch (error) {
      console.error("Error fetching lawyer:", error);
    }
  };
  useEffect(() => {
    if (!user || user.user._id !== lawyer_id) {
      navigate("/");
    } else {
      fetchLawyer();
    }
  }, [user, lawyer_id, navigate]);

  const options = [
    { value: "Criminal Lawyer", label: "Criminal Lawyer" },
    { value: "Employment Lawyer", label: "Employment Lawyer" },
    { value: "Immigration Lawyer", label: "Immigration Lawyer" },
    {
      value: "Personal Injury and Claim Lawyer",
      label: "Personal Injury and Claim Lawyer",
    },
    { value: "Civil Lawyer", label: "Civil Lawyer" },
    { value: "Tax Lawyer", label: "Tax Lawyer" },
  ];

  const handleChangeMulti = (selectedOptions) => {
    setSelectedCategories(selectedOptions);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    const thumbImageUrl = fileHandler
      ? await uploadFile(fileHandler, Date.now().toString())
      : dp;
    const updatedLawyer = {
      ...lawyer,
      firstname,
      lastname,
      experience,
      category: selectedCategories.map((option) => option.value), // Extracting values from selected options
      city,
      bio,
      image: thumbImageUrl,
    };

    try {
      const response = await axios.patch(
        `http://localhost:4000/api/lawyer/updateLawyer/${lawyer_id}`,
        updatedLawyer
      );
      console.log("Form submitted successfully!", response.data);
      fetchLawyer(); // Refresh lawyer data after update
    } catch (error) {
      if (error.response.status === 409) {
        alert("Data already exists.");
      } else {
        console.error("Error updating lawyer:", error);
      }
    }
  };

  const uploadFile = async (file, id) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await axios.post(
        `http://localhost:4000/api/file/image/${id}`,
        formData
      );
      return response.data.data.url;
    } catch (error) {
      console.error("File upload failed:", error);
      throw error;
    }
  };

  return (
    <div>
      <Header isloggedIn={true} />
      <div className="mt-10 mx-auto max-w-[1000px]">
        <div className="border border-[#00000069]">
          <div className="bg-[#3E7D5A] w-full py-3 flex items-center justify-center text-white font-semibold">
            User Profile
          </div>
          <div className="py-7 px-10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div>
                <div className="bg-[#677D66] flex items-center justify-center rounded-[12px]">
                  <img src={dp} className="w-full object-cover" alt="" />
                </div>
                <input
                  type="file"
                  className="hidden"
                  name="file"
                  id="file"
                  onChange={(e) => {
                    setFileHandler(e.target.files[0]);
                  }}
                />
                <label
                  className="w-full text-center cursor-pointer"
                  htmlFor="file"
                >
                  <div className="bg-[#E9E9E9A6] rounded-[8px] mt-3 py-2 border border-[#00000042] flex items-center justify-center">
                    Choose image
                  </div>
                </label>
              </div>
              <div className="lg:col-span-2">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  <input
                    type="text"
                    className="bg-[#E9E9E9A6] px-5 border border-[#CECECE] py-2 rounded-[8px]"
                    placeholder="First Name"
                    value={firstname}
                    onChange={(e) => setFirstname(e.target.value)}
                  />
                  <input
                    type="text"
                    className="bg-[#E9E9E9A6] px-5 border border-[#CECECE] py-2 rounded-[8px]"
                    placeholder="Last Name"
                    value={lastname}
                    onChange={(e) => setLastname(e.target.value)}
                  />
                  <input
                    type="text"
                    className="bg-[#E9E9E9A6] px-5 border border-[#CECECE] py-2 rounded-[8px]"
                    placeholder="Experience"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                  />
                  <select
                    className="px-5 py-2 border bg-[#E9E9E9A6] border-[#CECECE] rounded-[8px]"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  >
                    <option value="">City</option>
                    <option value="Moose Jaw">Moose Jaw</option>
                    <option value="Regina">Regina</option>
                  </select>
                  <Select
                    value={selectedCategories}
                    onChange={handleChangeMulti}
                    options={options}
                    placeholder="Category"
                    isMulti
                    styles={{
                      control: (baseStyles, state) => ({
                        ...baseStyles,
                        height:
                          state.selectProps.value &&
                          state.selectProps.value.length < 2
                            ? "55px"
                            : "",
                      }),
                    }}
                  />
                </div>
                <div className="mt-10">
                  <textarea
                    rows={6}
                    placeholder="Bio/Description"
                    className="bg-[#E9E9E9A6] w-full px-5 border border-[#CECECE] py-2 rounded-[8px]"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  ></textarea>
                </div>
                <div className="mt-10 flex items-center justify-end gap-5">
                  <button className="px-8 py-2 border border-[#AAAAAA] text-[#B5B5B5] flex items-center gap-2 rounded-[8px]">
                    Cancel
                  </button>
                  <button
                    className="px-8 py-2 text-white flex items-center gap-2 rounded-[8px] bg-[#4D8360]"
                    onClick={handleEdit}
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
