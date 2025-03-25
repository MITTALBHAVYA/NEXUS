import streamlit as st
import pandas as pd
import os
import json

# Define the CSV file path
CSV_FILE = "internship_data.csv"

# Initialize the CSV file if it doesn’t exist
if not os.path.exists(CSV_FILE):
    df = pd.DataFrame(columns=["Date", "Company_Name", "Platform", "Intern_Type", "Job_Type", "Package", "Referrals","Send"])
    df.to_csv(CSV_FILE, index=False)

st.title("Internship Application Tracker")

# User Inputs
date = st.date_input("Date of Apply")
company_name = st.text_input("Company Name")
platform = st.text_input("Platform (where you found it)")
intern_type = st.selectbox("Internship/Job Type", ["Internship", "Full-time Job"])
job_type = st.text_input("Job Type (e.g., Software Engineer, Data Analyst, etc.)")
package = st.text_input("Package/Stipend")

st.subheader("Referral Details")

# Initialize session state for referrals if not already present
if "referrals" not in st.session_state:
    st.session_state.referrals = []

# Referral Input Fields
referral_name = st.text_input("Referral Name")
referral_email = st.text_input("Referral Email")
referral_phone = st.text_input("Referral Phone")

if st.button("Add Referral"):
    if referral_name and referral_email:
        st.session_state.referrals.append({"Name": referral_name, "Email": referral_email, "Phone": referral_phone})
        st.success(f"Added: {referral_name} - {referral_email} ({referral_phone})")

# Display added referrals
st.subheader("Added Referrals")
if st.session_state.referrals:
    for r in st.session_state.referrals:
        st.write(f"- {r['Name']} ({r['Email']}, {r['Phone']})")
else:
    st.write("No referrals added yet.")

# Convert referrals to a formatted string for CSV storage
referrals_str = "; ".join([f"{r['Name']} ({r['Email']}, {r['Phone']})" for r in st.session_state.referrals])
referrals_json = json.dumps(st.session_state.referrals)

# Save Data
if st.button("Save to CSV"):
    new_data = pd.DataFrame([{
        "Date": date,
        "Company_Name": company_name,
        "Platform": platform,
        "Intern_Type": intern_type,
        "Job_Type": job_type,
        "Package": package,
        "Referrals": referrals_json,
        "Send":0
    }])

    new_data.to_csv(CSV_FILE, mode="a", header=False, index=False)
    st.success("Data saved successfully!")

    # Clear referrals after saving
    st.session_state.referrals = []

# Display existing records
st.subheader("Existing Data")
df = pd.read_csv(CSV_FILE)
st.dataframe(df)
