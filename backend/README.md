# KareAI: Analytics Agent

## Setup

1. Clone the repository:

   ```bash
   git clone <repository_url>
   ```

2. Create a virtual environment

   ```bash
   python -m venv venv
   ```

3. Activate the virtual environment:

   - Windows:

   ```bash
   venv\Scripts\activate
   ```

   - Linux/macOS:

   ```bash
   source venv/bin/activate
   ```

4. Install the dependencies:

   ```bash
   pip install -r requirements.txt
   ```

5. Apply database migrations using Alembic:

   ```bash
   alembic upgrade head
   ```

6. Configure the project:

   Create a `.env` file and set the required environment variables.

7. Start the development server:

   ```bash
   uvicorn app:app --reload
   ```

#### Note:
- make sure to setup a postgres database and set the database url in the .env file
- Swagger docs can be found at `http://localhost:8000/docs`