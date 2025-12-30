package com.ats.controller;

import com.ats.entity.Attachment;
import com.ats.repository.AttachmentRepository;
import com.ats.service.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.net.MalformedURLException;
import java.nio.file.Path;
import java.util.List;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/attachments")
public class AttachmentController {

    @Autowired
    private AttachmentRepository attachmentRepository;

    @Autowired
    private FileStorageService fileStorageService;

    @GetMapping("/{relatedType}/{relatedId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECRUITER') or hasRole('CLIENT')")
    public List<Attachment> getAttachments(@PathVariable String relatedType, @PathVariable Long relatedId) {
        return attachmentRepository.findByRelatedTypeAndRelatedIdOrderByUploadedAtDesc(relatedType.toUpperCase(),
                relatedId);
    }

    @PostMapping("/upload")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECRUITER')")
    public Attachment uploadFile(@RequestParam("file") MultipartFile file,
            @RequestParam("relatedType") String relatedType,
            @RequestParam("relatedId") Long relatedId) {

        String fileName = fileStorageService.storeFile(file);

        Attachment attachment = new Attachment();
        attachment.setFileName(file.getOriginalFilename());
        attachment.setFileType(file.getContentType());
        attachment.setSize(file.getSize());
        attachment.setFilePath(fileName);
        attachment.setRelatedType(relatedType.toUpperCase());
        attachment.setRelatedId(relatedId);

        return attachmentRepository.save(attachment);
    }

    @GetMapping("/download/{id}")
    public ResponseEntity<Resource> downloadFile(@PathVariable Long id) {
        Attachment attachment = attachmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("File not found with id " + id));

        Path filePath = fileStorageService.loadFileAsPath(attachment.getFilePath());
        Resource resource;
        try {
            resource = new UrlResource(filePath.toUri());
            if (!resource.exists()) {
                throw new RuntimeException("File not found " + attachment.getFileName());
            }
        } catch (MalformedURLException ex) {
            throw new RuntimeException("File not found " + attachment.getFileName(), ex);
        }

        // Determine Content-Disposition based on file type
        // Use 'inline' for PDFs and images to enable preview, 'attachment' for others
        String contentDisposition;
        String contentType = attachment.getFileType();
        if (contentType != null && (contentType.equals("application/pdf") || contentType.startsWith("image/"))) {
            contentDisposition = "inline; filename=\"" + attachment.getFileName() + "\"";
        } else {
            contentDisposition = "attachment; filename=\"" + attachment.getFileName() + "\"";
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(attachment.getFileType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, contentDisposition)
                .body(resource);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECRUITER')")
    public ResponseEntity<?> deleteFile(@PathVariable Long id) {
        // In a real app, you might want to delete the physical file too,
        // or just mark it as deleted in DB. For now, just DB delete.
        attachmentRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
