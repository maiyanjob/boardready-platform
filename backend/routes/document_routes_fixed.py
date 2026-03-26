from flask import Blueprint, send_file, jsonify, request
from flask_login import login_required
from models.base import get_db
from sqlalchemy import text
from docxtpl import DocxTemplate
from datetime import datetime
import os
import tempfile

# ADD THESE IMPORTS FOR DOCX
from docx import Document
from docx.shared import Pt, RGBColor, Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH

doc_bp = Blueprint('documents', __name__)

# ... rest of the file stays the same
