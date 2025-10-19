import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';

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

  async deleteFile(fileUrl: string): Promise<void> {
    try {
      // Extract the key from the URL
      // URL format: https://bucket-name.s3.amazonaws.com/path/to/file
      const urlParts = fileUrl.split('/');
      const key = urlParts.slice(3).join('/'); // Remove 'https:', '', 'bucket-name.s3.amazonaws.com'
      
      this.logger.log('Deleting file from S3:', {
        bucket: this.bucketName,
        key,
        originalUrl: fileUrl
      });

      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
      this.logger.log('File deleted successfully from S3:', key);
    } catch (error) {
      this.logger.error('Error deleting file from S3:', error);
      throw error;
    }
  }

  async downloadFile(fileUrl: string): Promise<Buffer> {
    try {
      // Extract the key from the URL
      // URL format: https://bucket-name.s3.amazonaws.com/path/to/file
      const urlParts = fileUrl.split('/');
      const key = urlParts.slice(3).join('/'); // Remove 'https:', '', 'bucket-name.s3.amazonaws.com'
      
      this.logger.log('Downloading file from S3:', {
        bucket: this.bucketName,
        key,
        originalUrl: fileUrl
      });

      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const response = await this.s3Client.send(command);
      
      if (!response.Body) {
        throw new Error('File not found or empty');
      }

      // Convert the stream to a buffer
      const chunks: Uint8Array[] = [];
      const stream = response.Body as any;
      
      for await (const chunk of stream) {
        chunks.push(chunk);
      }
      
      const buffer = Buffer.concat(chunks);
      this.logger.log('File downloaded successfully from S3:', key);
      
      return buffer;
    } catch (error) {
      this.logger.error('Error downloading file from S3:', error);
      throw error;
    }
  }
} 