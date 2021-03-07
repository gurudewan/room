# receive an email address, and send the magic link
import smtplib, ssl
import email.message
import logging

from flask import render_template, Flask

from templates import room_login_email

from secure_keys import credentials
# get credentials
environment = credentials.get("environment")
CORE_URL = credentials.get("CORE_URL")[environment]
EMAIL_ACCOUNT = credentials.get("EMAIL_ACCOUNT")
email_address = EMAIL_ACCOUNT["address"]
email_password = EMAIL_ACCOUNT["password"]

def send_magic_link(email_addr, magic_token):
    try:
        context = ssl.create_default_context()
        port = 465 # for SSL

        with smtplib.SMTP_SSL("smtp.gmail.com", port, context=context) as server:
            
            msg = email.message.Message()
            msg['Subject'] = 'Your key to the room'
            msg['From'] = email_address
            msg['To'] = email_addr
            msg.add_header('Content-Type', 'text/html')
            magic_link = CORE_URL + "/app/magic-link/" + magic_token
            email_content = room_login_email.email_content.replace('magic_link_insert_here', magic_link)

            logging.info("The magic link is " + magic_link)
            msg.set_payload(email_content)
            
            server.login(email_address, email_password)

            server.sendmail(msg['From'], [msg['To']], msg.as_string())
        
        return True

    except smtplib.SMTPException:
        logging.error('An error occured while sending an email')
        return False
        
if __name__ == '__main__':
    email_addr = 'gauravdewan01@gmail.com'

    send_magic_link(email_addr, "")