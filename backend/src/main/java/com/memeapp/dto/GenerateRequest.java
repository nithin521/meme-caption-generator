package com.memeapp.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.Setter;

/**
 * Full set of model knobs exposed to the frontend, mirroring the
 * generate_captions() parameters in meme_caption_pipeline.py.
 */
@Getter
@Setter
public class GenerateRequest {

    private String prompt = "";

    @Min(1)
    @Max(30)
    private int n = 5;

    @DecimalMin("0.1")
    @DecimalMax("2.0")
    private double temperature = 0.75;

    @Min(0)
    @Max(200)
    private int topK = 40;

    @DecimalMin("0.0")
    @DecimalMax("1.0")
    private double topP = 0.90;

    @Min(5)
    @Max(80)
    private int maxNewTokens = 25;

    @DecimalMin("1.0")
    @DecimalMax("2.0")
    private double repetitionPenalty = 1.1;

    /** Save results to the public gallery under the current user. */
    private boolean saveToGallery = true;
}
