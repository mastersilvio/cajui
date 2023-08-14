import streamlit as st
from langchain.llms import OpenAI
import os
from dotenv import load_dotenv

load_dotenv()

st.set_page_config(page_title="Cajui")
st.title('Cajui')
st.subheader('Gestão de Dados de Compras')
