FROM python:3.11-slim

# (Keep whatever WORKDIR you currently have, e.g., WORKDIR /app/ml)
WORKDIR /app/ml 

# 1. Install system compilers
RUN apt-get update \
    && apt-get install -y --no-install-recommends gcc g++ \
    && rm -rf /var/lib/apt/lists/*

# 2. Pre-install build tools and the EXACT numpy/scipy versions
RUN pip install --no-cache-dir setuptools wheel cython "numpy>=1.24,<2.0.0" "scipy>=1.11,<1.13.0"

# 3. Install ONLY lightfm without build isolation
RUN pip install --no-cache-dir --no-build-isolation lightfm==1.17

# 4. Copy your requirements file
COPY requirements.txt ./

# 5. Install the rest of the backend and ML requirements NORMALLY
RUN pip install --no-cache-dir -r requirements.txt

# Copy your ML code
COPY ml/ ./

# (Keep whatever CMD or ENTRYPOINT you already had at the bottom)