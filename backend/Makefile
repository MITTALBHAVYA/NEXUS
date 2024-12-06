.PHONY: setup activate clean run test

VENV=venv
PYTHON=$(VENV)/bin/python
PIP=$(VENV)/bin/pip

setup:
	@python3 -m venv $(VENV)
	source $(VENV)/bin/activate 
	$(PIP) install -r requirements.txt

activate:
	source $(VENV)/bin/activate

clean:
	rm -rf $(VENV)
	rm -rf __pycache__ 	*/__pycache__
	rm -rf *.pyc */*.pyc

run:
	uvicorn app:app --reload --port 8000 --host 0.0.0.0

test:
	$(PYTHON) -m unittest discover -s tests