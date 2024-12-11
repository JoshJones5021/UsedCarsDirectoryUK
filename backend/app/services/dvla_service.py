import requests
import logging
import json

logging.basicConfig(level=logging.DEBUG)

class dvla_service:
    @staticmethod
    def check_registration(registration_number):
        api_key = "VC95RFbaP8aaO4HuSVzXv4cELXYixpwU9xY5wsF2"
        headers = {
            "x-api-key": api_key,
            "Content-Type": "application/json",
            "Accept": "*/*"
        }
        
        payload = json.dumps({"registrationNumber": registration_number})

        # Make the POST request to the DVLA API
        response = requests.post(
            "https://driver-vehicle-licensing.api.gov.uk/vehicle-enquiry/v1/vehicles",
            headers=headers,
            data=payload
        )

        # Log the response
        logging.info(f"DVLA API response status: {response.status_code}")
        logging.info(f"DVLA API response body: {response.text}")

        # Check for a successful response
        if response.status_code == 200:
            formatted_response = dvla_service.format_response(response.json())
            return formatted_response, response.status_code
        else:
            logging.error(f"DVLA API request failed with status {response.status_code}: {response.text}")
            return {"message": "DVLA validation failed", "response": response.text}, response.status_code

    @staticmethod
    def format_response(data):
        if 'make' in data:
            data['make'] = data['make'].capitalize()
        if 'colour' in data:
            data['colour'] = data['colour'].capitalize()
        if 'fuelType' in data:
            data['fuelType'] = data['fuelType'].capitalize()
        if 'engineCapacity' in data:
            data['engine'] = f"{data['engineCapacity'] / 1000:.1f}L"
            del data['engineCapacity']
        return data

if __name__ == "__main__":
    service = dvla_service()
    registration_info, status_code = service.check_registration("RV14EXX")
    
    if status_code == 200:
        print(registration_info)