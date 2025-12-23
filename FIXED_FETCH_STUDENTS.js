// COPY THIS FUNCTION AND REPLACE fetchStudents in AdminPanel.tsx (lines 85-114)

const fetchStudents = async () => {
    try {
        setIsLoading(true);

        // Fetch both students and ALL profiles at once
        const [studentRecords, allProfiles] = await Promise.all([
            studentsDB.getAll(),
            profilesDB.getAll()  // Get ALL profiles, not just students
        ]);

        console.log('✅ Student records:', studentRecords);
        console.log('✅ All profiles:', allProfiles);

        // Create a Map for O(1) profile lookup by _id
        const profileMap = new Map();
        allProfiles.forEach((profile) => {
            profileMap.set(profile._id, profile);
        });

        // Match each student with their profile
        const studentsWithProfiles = studentRecords.map((student) => {
            const profile = profileMap.get(student.user_id);

            if (!profile) {
                console.warn(`⚠️ No profile found for student ${student._id} with user_id: ${student.user_id}`);
            } else {
                console.log(`✅ Found profile for ${profile.name}: ${profile.email}`);
            }

            return {
                ...student,
                profile: profile || null
            };
        });

        console.log('✅ Final students with profiles:', studentsWithProfiles);
        setStudents(studentsWithProfiles);
        setFilteredStudents(studentsWithProfiles);

    } catch (error) {
        console.error('❌ Error fetching students:', error);
        toast({
            title: "Error",
            description: "Failed to fetch students",
            variant: "destructive"
        });
    } finally {
        setIsLoading(false);
    }
};
