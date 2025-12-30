package com.ats.payload.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonAlias;
import lombok.Data;
import java.util.List;

@Data
public class JwtResponse {
    private String token;
    private String type = "Bearer";
    private Long id;
    private String username;
    private String email;
    @JsonProperty("profilePictureUrl")
    @JsonAlias("profile_picture_url")
    private String profilePictureUrl;
    private List<String> roles;

    public JwtResponse(String accessToken, Long id, String username, String email, String profilePictureUrl,
            List<String> roles) {
        this.token = accessToken;
        this.id = id;
        this.username = username;
        this.email = email;
        this.profilePictureUrl = profilePictureUrl;
        this.roles = roles;
    }
}
