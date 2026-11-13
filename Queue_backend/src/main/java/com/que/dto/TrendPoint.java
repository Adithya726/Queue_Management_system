package com.que.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class TrendPoint {

    private String time;
    private Integer queueLength;
}