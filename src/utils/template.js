export const heartRateTemplate = {
    resourceType: "Observation",
    status: "final",
    category: [
        {
            coding: [
                {
                    system: "http://terminology.hl7.org/CodeSystem/observation-category",
                    code: "vital-signs",
                    display: "Vital Signs",
                },
            ],
            text: "Vital Signs",
        },
    ],
    code: {
        coding: [
            {
                system: "http://loinc.org",
                code: "8867-4",
                display: "Heart Rate",
            },
        ],
        text: "Heart rate",
    },
    subject: {
        reference: "Patient/example",
    },
    valueQuantity: {
        unit: "beats/minute",
        system: "http://unitsofmeasure.org",
        code: "/min",
    },
};

export const oxygenSaturationTemplate = {
    resourceType: "Observation",
    status: "final",
    category: [
        {
            coding: [
                {
                    system: "http://terminology.hl7.org/CodeSystem/observation-category",
                    code: "vital-signs",
                    display: "Vital Signs",
                },
            ],
            text: "Vital Signs",
        },
    ],
    code: {
        coding: [
            {
                system: "http://loinc.org",
                code: "2708-6",
                display: "Oxygen saturation in Arterial blood",
            },
        ],
    },
    subject: {
        reference: "Patient/example",
    },
    valueQuantity: {
        unit: "%",
        system: "http://unitsofmeasure.org",
        code: "%",
    },
};