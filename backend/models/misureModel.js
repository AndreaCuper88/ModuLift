const mongoose = require('mongoose');
const { Schema } = mongoose;

const DerivedSchema = new Schema(
    {
        sum3: Number,        // Σ3 in mm
        bodyDensity: Number, // densità corporea (g/ml)
        fatPercent: Number,  // % massa grassa
    },
    { _id: false }
);

const MisureSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'Utente',
            required: true,
            index: true,
        },
        measuredAt: { type: Date, default: Date.now, index: true },

        sex: { type: String, enum: ['male', 'female'], required: true },
        method: { type: String, default: 'JP3' },   //Necessario prevedendo possibile implementazione di formula a 7 pliche
        ageAtMeasure: { type: Number }, // in anni (es. 27.4)

        // Pliche: mappa site->mm (es. { chest: 8, abdomen: 12, thigh: 11 } )
        sites: {
            type: Map,
            of: Number,
            default: {},
        },

        pesoKg: Number,        // Peso (kg)
        toraceCm: Number,      // Torace (cm)
        spalleCm: Number,      // Spalle (cm)
        bicipiteCm: Number,    // Bicipite (cm)
        ombelicoCm: Number,    // Ombelico (cm)
        quadricipiteCm: Number,// Quadricipite (cm)

        // Calcolo dati derivati
        derived: { type: DerivedSchema, default: {} },
        isComplete: { type: Boolean, default: false },

    },
    {
        timestamps: true,
        versionKey: false,
    }
);

MisureSchema.pre('save', function (next) {
    try {
        const method = this.method || 'JP3';
        const sex = this.sex;                   // 'male' | 'female'
        const age = Number(this.ageAtMeasure) || 0;
        const sites = this.sites || new Map();

        let keys;
        if (method === 'JP3') {
            keys = sex === 'female'
                ? ['triceps', 'suprailiac', 'thigh']
                : ['chest', 'abdomen', 'thigh'];
        } else {
            // Predisposizione per altri metodi
            this.derived = {};
            this.isComplete = false;
            return next();
        }

        // Helper per leggere da Map
        const read = (k) => {
            if (sites instanceof Map) return Number(sites.get(k));
            return Number(sites?.[k]);
        };
        const vals = keys.map(read);
        const complete = vals.every(v => Number.isFinite(v) && v >= 0);

        if (!complete) {
            this.derived = {};
            this.isComplete = false;
            return next();
        }

        const sum3 = vals.reduce((s, v) => s + v, 0);
        let BD;
        if (sex === 'female') {
            BD = 1.0994921 - 0.0009929 * sum3 + 0.0000023 * sum3 * sum3 - 0.0001392 * age;
        } else {
            BD = 1.10938  - 0.0008267 * sum3 + 0.0000016 * sum3 * sum3 - 0.0002574 * age;
        }
        const fatPercent = 495 / BD - 450;

        this.derived = { sum3, bodyDensity: BD, fatPercent };
        this.isComplete = true;
        next();
    } catch (err) {
        next(err);
    }
});


module.exports = mongoose.model('MisuraPliche', MisureSchema);
