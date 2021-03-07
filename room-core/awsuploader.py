import boto3, botocore
from secure_keys import credentials
import base64
import io

from pprint import pprint

#environment = credentials.get("environment")
PHOTOGRAPHER_S3_KEYS = credentials.get("PHOTOGRAPHER_S3_KEYS")

ACCESS_KEY = PHOTOGRAPHER_S3_KEYS['ACCESS_KEY']
SECRET = PHOTOGRAPHER_S3_KEYS['SECRET']
BUCKET_NAME = PHOTOGRAPHER_S3_KEYS['BUCKET_NAME']

s3 = boto3.client(
   "s3",
   aws_access_key_id=ACCESS_KEY,
   aws_secret_access_key=SECRET
)

#s3 = boto3.resource('s3', aws_access_key_id=ACCESS_KEY, aws_secret_access_key=SECRET)

def uploadImage(file, filename):

    fileobj = io.BytesIO(base64.b64decode(file))
    filename = filename + '.png'
    try:
        s3.upload_fileobj(
            fileobj,
            BUCKET_NAME,
            filename,
            ExtraArgs={
                "ACL": 'public-read',
                "ContentType": 'image/png'
            }
        )

    except Exception as e:
        print("Something Happened: ", e)
        return e


    file_url = f'http://{BUCKET_NAME}.s3.amazonaws.com/{filename}'

    pprint(file_url)
    
    return file_url

if __name__ == '__main__':
    pprint('-----aws uploader------')

    #uploadImage(img_base64, 'hello')
