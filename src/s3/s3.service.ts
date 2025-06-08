import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;

  constructor(private configService: ConfigService) {
    this.s3Client = new S3Client({
      region: this.configService.get<string>('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY'),
      },
    });
    this.bucketName = this.configService.get<string>('AWS_S3_BUCKET_NAME');
  }

  async uploadFile(file: any, path: string): Promise<string> {
    try {
      // Create a unique file name
      const fileName = `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;
      
      // Combine path and filename
      const key = `${path}/${fileName}`;
      
      this.logger.log('Uploading file to S3:', {
        bucket: this.bucketName,
        key,
        contentType: file.mimetype,
        size: file.size
      });

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      await this.s3Client.send(command);
      
      // Return the public URL
      const fileUrl = `https://${this.bucketName}.s3.amazonaws.com/${key}`;
      this.logger.log('File uploaded successfully:', fileUrl);
      
      return fileUrl;
    } catch (error) {
      this.logger.error('Error uploading file to S3:', error);
      throw error;
    }
  }
} 