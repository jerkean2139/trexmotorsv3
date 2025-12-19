import { google } from 'googleapis';
import { logger } from './logger';

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  thumbnailLink?: string;
  webContentLink?: string;
  webViewLink?: string;
}

interface DriveImage {
  id: string;
  name: string;
  url: string;
  thumbnailUrl: string;
}

class GoogleDriveService {
  private drive: ReturnType<typeof google.drive> | null = null;
  private initialized = false;

  private initialize() {
    if (this.initialized) return;

    const credentialsJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    if (!credentialsJson) {
      logger.warn('GOOGLE_SERVICE_ACCOUNT_JSON not configured - Google Drive sync disabled');
      return;
    }

    try {
      const credentials = JSON.parse(credentialsJson);
      const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/drive.readonly'],
      });

      this.drive = google.drive({ version: 'v3', auth });
      this.initialized = true;
      logger.info('Google Drive service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Google Drive service:', { error });
    }
  }

  isConfigured(): boolean {
    this.initialize();
    return this.drive !== null;
  }

  async listImagesInFolder(folderId: string): Promise<DriveImage[]> {
    this.initialize();
    
    if (!this.drive) {
      throw new Error('Google Drive service not configured');
    }

    try {
      const response = await this.drive.files.list({
        q: `'${folderId}' in parents and mimeType contains 'image/' and trashed = false`,
        pageSize: 100,
        fields: 'files(id, name, mimeType, thumbnailLink, webContentLink, webViewLink)',
        orderBy: 'name',
      });

      const files = response.data.files || [];
      
      return files
        .filter((file): file is typeof file & { id: string; name: string } => 
          Boolean(file.id && file.name))
        .map((file) => ({
          id: file.id,
          name: file.name,
          url: `https://lh3.googleusercontent.com/d/${file.id}=w1200`,
          thumbnailUrl: `https://lh3.googleusercontent.com/d/${file.id}=w400`,
        }));
    } catch (error: any) {
      logger.error(`Error listing images from folder ${folderId}:`, error.message);
      
      if (error.code === 404) {
        throw new Error('Folder not found. Make sure the folder is shared with the service account.');
      }
      if (error.code === 403) {
        throw new Error('Access denied. Share the folder with: manumation@kobllm.iam.gserviceaccount.com');
      }
      
      throw error;
    }
  }

  async getFolderInfo(folderId: string): Promise<{ name: string; id: string } | null> {
    this.initialize();
    
    if (!this.drive) {
      throw new Error('Google Drive service not configured');
    }

    try {
      const response = await this.drive.files.get({
        fileId: folderId,
        fields: 'id, name, mimeType',
      });

      if (response.data.mimeType !== 'application/vnd.google-apps.folder') {
        throw new Error('The provided ID is not a folder');
      }

      return {
        id: response.data.id!,
        name: response.data.name!,
      };
    } catch (error: any) {
      logger.error(`Error getting folder info for ${folderId}:`, error.message);
      
      if (error.code === 404) {
        return null;
      }
      
      throw error;
    }
  }

  extractFolderIdFromUrl(url: string): string | null {
    if (!url) return null;
    
    // Handle direct folder ID
    if (/^[a-zA-Z0-9_-]{25,}$/.test(url)) {
      return url;
    }

    // Handle various Google Drive folder URL formats
    const patterns = [
      /\/folders\/([a-zA-Z0-9_-]+)/,
      /id=([a-zA-Z0-9_-]+)/,
      /\/d\/([a-zA-Z0-9_-]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }

    return null;
  }
}

export const googleDriveService = new GoogleDriveService();
